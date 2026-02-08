
import unittest
from langchain_core.messages import HumanMessage
from search_agent import extract_urls_node, SearchAgentState

class TestSearchAgent(unittest.TestCase):
    
    def test_extract_urls(self):
        # Test case 1: No URLs
        state = {"messages": [HumanMessage(content="Hello, how are you?")]}
        result = extract_urls_node(state)
        self.assertEqual(result["urls"], [])
        
        # Test case 2: One URL
        state = {"messages": [HumanMessage(content="Check this out: https://www.google.com")]}
        result = extract_urls_node(state)
        self.assertEqual(result["urls"], ["https://www.google.com"])
        
        # Test case 3: Two URLs
        state = {"messages": [HumanMessage(content="Compare https://www.google.com and https://www.bing.com")]}
        result = extract_urls_node(state)
        self.assertEqual(len(result["urls"]), 2)
        self.assertIn("https://www.google.com", result["urls"])
        self.assertIn("https://www.bing.com", result["urls"])
        
        # Test case 4: More than two URLs
        state = {"messages": [HumanMessage(content="Links: https://a.com, https://b.com, https://c.com")]}
        result = extract_urls_node(state)
        self.assertEqual(len(result["urls"]), 2)
        self.assertEqual(result["urls"], ["https://a.com", "https://b.com"])

if __name__ == "__main__":
    unittest.main()
