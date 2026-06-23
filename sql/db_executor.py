import os
import pandas as pd
from langchain_community.utilities import SQLDatabase

# Connect LangChain to the local SQLite database (same path as api.py)
DB_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(DB_DIR, "ecommerce.db")
db = SQLDatabase.from_uri(f"sqlite:///{DB_PATH}")


def execute_llm_query(sql_query):
    """
    Executes SQL query and returns JSON-friendly data.
    """
    try:
        # Clean query
        clean_query = sql_query.strip()

        # Get SQLAlchemy engine
        engine = db._engine

        # Execute query
        dataframe = pd.read_sql_query(clean_query, engine)

        # If no rows found
        if dataframe.empty:
            return []

        # Return as list of dictionaries
        return dataframe.to_dict(orient="records")

    except Exception as error:
        return {
            "error": str(error)
        }


if __name__ == "__main__":
    # Test query
    mock_llm_output = "SELECT * FROM products;"

    result = execute_llm_query(mock_llm_output)

    print(result)