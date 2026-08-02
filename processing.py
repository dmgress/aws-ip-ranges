import marimo

__generated_with = "0.23.15"
app = marimo.App()


@app.cell
def _():
    import polars as pl
    import marimo as mo
    import ipaddress

    from pathlib import Path

    notebook_dir = mo.notebook_dir()
    assert notebook_dir is not None
    git_root_dir = notebook_dir
    output_dir = notebook_dir / "output"
    ip_ranges_ndjson_file = output_dir / "ip-ranges.full.json"
    return ipaddress, output_dir, pl


@app.cell
def _(output_dir, pl):


    # ip_ranges_json_df = pl.read_ndjson((ip_ranges_ndjson_file))
    ip_ranges_json_df = pl.read_json((output_dir / "ip-ranges.1780659542.json"))
    return (ip_ranges_json_df,)


@app.cell
def _():
    # def cidr_to_int(cidr):
    #     net = ipaddress.ip_network(cidr)
    #     return (int(net.network_address), int(net.broadcast_address))

    # from netaddr import IPNetwork

    # import numpy as np

    # def cidr_to_ints(cidr):
    #     try:
    #         net = IPNetwork(cidr)
    #         return (int(net.network), int(net.broadcast))
    #     except Exception:
    #         return (None, None)
    return


@app.cell
def _(ip_ranges_json_df, ipaddress, pl):


    ip_ranges_cleaned_df = (
        ip_ranges_json_df.lazy()
        .with_columns(
            # Flatten prefixes and ipv6_prefixes into a single list of structs
            all_prefixes=pl.concat_list("prefixes", "ipv6_prefixes"),
            # Assign prefix_type based on the source column
            prefix_type=pl.when(pl.col("prefixes").is_not_null())
            .then(pl.lit("ipv4"))
            .otherwise(pl.lit("ipv6"))
            .repeat_by(pl.col("prefixes").list.len() + pl.col("ipv6_prefixes").list.len())
        )
        .explode("all_prefixes", "prefix_type")
        .with_columns(
            ip_prefix=pl.coalesce(
                pl.col("all_prefixes").struct.field("ip_prefix"),
                pl.col("all_prefixes").struct.field("ipv6_prefix")
            ),
            start_date=pl.col("syncToken").str.to_datetime("%s"),
            region=pl.col("all_prefixes").struct.field("region"),
            service=pl.col("all_prefixes").struct.field("service"),
            syncToken=pl.col("syncToken")
        )
        .drop("syncToken","createDate","all_prefixes", "prefixes", "ipv6_prefixes")
        .collect()
    )

    assert isinstance(ip_ranges_cleaned_df, pl.DataFrame)
    del ip_ranges_json_df

    # Step 1: Extract unique CIDRs
    unique_cidrs = ip_ranges_cleaned_df["ip_prefix"].unique().to_list()
    print(f"Unique CIDRs: {len(unique_cidrs)}")

    # Step 2: Convert unique CIDRs to integers (single-threaded)
    start_ips: list[int | None] = []
    end_ips: list[int | None] = []
    for cidr in unique_cidrs:
        try:
            net = ipaddress.ip_network(cidr, strict=False)
            start_ips.append(int(net.network_address))
            end_ips.append(int(net.broadcast_address))
        except:
            start_ips.append(None)
            end_ips.append(None)

    # Step 3: Create lookup DataFrame with explicit UInt128 dtype
    lookup_df = pl.DataFrame({
        "ip_prefix": unique_cidrs,
        "start_ip": pl.Series("start_ip", start_ips, dtype=pl.UInt128),
        "end_ip": pl.Series("end_ip", end_ips, dtype=pl.UInt128)
    })

    # Step 4: Join with original DataFrame
    ip_ranges_cleaned_df = ip_ranges_cleaned_df.join(
        lookup_df,
        on="ip_prefix",
        how="left"
    )
    return (ip_ranges_cleaned_df,)


@app.cell
def _(ip_ranges_cleaned_df, output_dir, pl):
    import duckdb

    # Connect to DuckDB
    conn = duckdb.connect(database=output_dir / 'ip_ranges.db', read_only=False)

    # Convert UInt128 to strings for DuckDB
    df_duckdb = ip_ranges_cleaned_df.with_columns(
        start_ip=pl.col("start_ip").cast(pl.Utf8),
        end_ip=pl.col("end_ip").cast(pl.Utf8),
        start_date=pl.col("start_date").cast(pl.Datetime)  # Ensure timestamp type
    )

    # Register the DataFrame as a temporary view
    conn.register("temp_ip_ranges", df_duckdb)

    # Create the final table with LEAD in a SELECT statement
    conn.execute("""
        CREATE OR REPLACE TABLE ip_ranges AS
        SELECT
            prefix_type,
            ip_prefix,
            region,
            service,
            start_date,
            LEAD(start_date) OVER (
                PARTITION BY ip_prefix, region, service
                ORDER BY start_date
            ) AS end_date,
            start_ip,
            end_ip
        FROM temp_ip_ranges
    """)

    # Query the result
    processed_ip_ranges_df = conn.execute("""
        SELECT
            prefix_type,
            ip_prefix,
            region,
            service,
            start_date,
            end_date,
            start_ip,
            end_ip
        FROM ip_ranges
    """).fetchdf()

    conn.close()
    pl.DataFrame(processed_ip_ranges_df).write_parquet(output_dir / "ip_ranges.polars.parquet")
    return


@app.cell
def _(output_dir, pl):

    parquet_file = output_dir / "ip_ranges.polars.parquet"

    straight = pl.read_parquet(parquet_file)
    straight.shape
    return (straight,)


@app.cell
def _(straight):
    straight.head()
    return


@app.cell
def _(pl, straight):
    straight.filter(pl.col("end_date").is_null() & pl.col("service").eq("AMAZON")).unique().head()
    return


if __name__ == "__main__":
    app.run()
