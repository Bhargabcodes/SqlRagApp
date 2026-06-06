import pandas as pd
from langchain_community.utilities import SQLDatabase

# Connect LangChain to your local SQLite file
db = SQLDatabase.from_uri("sqlite:///ecommerce.db")


def execute_user_query(sql_query):
    """Executes the user's custom SQL query and returns a formatted DataFrame."""
    try:
        engine = db._engine
        dataframe = pd.read_sql_query(sql_query, engine)
        return dataframe
    except Exception as error:
        # Returns the database error message if the SQL syntax is wrong
        return f"SQL Error: {error}"


def start_interactive_session():
    print("=" * 60)
    print("        INTERACTIVE SQL TERMINAL (Connected to LangChain DB)        ")
    print("=" * 60)
    print("Type your SQL queries below. Type 'exit' or 'quit' to close.\n")

    while True:
        # Capture custom input from the user via the command line
        user_input = input("SQL> ")

        # Check for exit commands
        if user_input.strip().lower() in ["exit", "quit"]:
            print("Exiting interactive terminal. Goodbye!")
            break

        # Skip empty inputs
        if not user_input.strip():
            continue

        # Process the query and get the result
        result = execute_user_query(user_input)

        # Print the output dynamically based on success or failure
        print("\nResult:")
        if isinstance(result, pd.DataFrame):
            if result.empty:
                print("Query executed successfully, but returned 0 rows.")
            else:
                print(result.to_markdown(index=False))
        else:
            print(result)

        print("-" * 60 + "\n")


if __name__ == "__main__":
    start_interactive_session()