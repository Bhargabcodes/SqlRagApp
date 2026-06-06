import pandas as pd
from langchain_community.utilities import SQLDatabase

db = SQLDatabase.from_uri("sqlite:///ecommerce.db")

def execute_llm_query(sql_query):
    try:
        # Clean the string just in case the LLM adds spaces
        clean_query = sql_query.strip()
        
        engine = db._engine
        dataframe = pd.read_sql_query(clean_query, engine)
        
        if dataframe.empty:
            return "Query executed successfully, but returned 0 rows."
            
        return dataframe.to_markdown(index=False)
        
    except Exception as error:
        return f"SQL Error: {error}"

if __name__ == "__main__":
    # Test it by simulating an LLM output
    mock_llm_output = "SELECT * FROM products LIMIT 2;"
    final_result = execute_llm_query(mock_llm_output)
    print(final_result)