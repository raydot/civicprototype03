"""
Category data loader for VoterPrime political categories
Handles loading and initializing political categories from JSON files
"""
import json
from pathlib import Path
from typing import List, Dict, Any, Optional
from ..utils.logging import structured_logger


class CategoryLoader:
    """Loads and manages political category data for VoterPrime"""
    
    def __init__(self, data_dir: Optional[Path] = None):
        if data_dir is None:
            # Default to data directory relative to this file
            self.data_dir = Path(__file__).parent
        else:
            self.data_dir = Path(data_dir)
        
        self.logger = structured_logger
    
    def load_political_categories(self, filename: str = "political_categories.json") -> List[Dict[str, Any]]:
        """
        Load political categories from JSON file
        
        Args:
            filename: Name of the JSON file containing categories
            
        Returns:
            List of category dictionaries
        """
        try:
            file_path = self.data_dir / filename
            
            if not file_path.exists():
                raise FileNotFoundError(f"Category file not found: {file_path}")
            
            self.logger.info(f"Loading political categories from {file_path}")
            
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            categories = data.get('categories', [])
            
            # Validate category structure
            validated_categories = []
            for category in categories:
                if self._validate_category(category):
                    validated_categories.append(category)
                else:
                    self.logger.warning(f"Skipping invalid category: {category.get('name', 'Unknown')}")
            
            self.logger.info(f"Loaded {len(validated_categories)} valid political categories")
            
            return validated_categories
        
        except Exception as e:
            self.logger.error(f"Failed to load political categories: {str(e)}")
            raise RuntimeError(f"Category loading failed: {str(e)}")
    
    def load_categories_by_type(self, category_type: str, filename: str = "political_categories.json") -> List[Dict[str, Any]]:
        """
        Load categories filtered by type
        
        Args:
            category_type: Type of categories to load ('issue', 'candidate_attribute', 'policy', 'attribute')
            filename: Name of the JSON file containing categories
            
        Returns:
            List of category dictionaries of the specified type
        """
        all_categories = self.load_political_categories(filename)
        filtered_categories = [cat for cat in all_categories if cat.get('type') == category_type]
        
        self.logger.info(f"Loaded {len(filtered_categories)} categories of type '{category_type}'")
        
        return filtered_categories
    
    def get_category_types(self, filename: str = "political_categories.json") -> List[str]:
        """
        Get all available category types
        
        Args:
            filename: Name of the JSON file containing categories
            
        Returns:
            List of unique category types
        """
        categories = self.load_political_categories(filename)
        types = list(set(cat.get('type', 'unknown') for cat in categories))
        
        return sorted(types)
    
    def _validate_category(self, category: Dict[str, Any]) -> bool:
        """
        Validate that a category has required fields
        
        Args:
            category: Category dictionary to validate
            
        Returns:
            True if category is valid, False otherwise
        """
        required_fields = ['id', 'name', 'type']
        
        for field in required_fields:
            if field not in category:
                self.logger.warning(f"Category missing required field '{field}': {category}")
                return False
        
        # Validate ID is integer
        if not isinstance(category['id'], int):
            self.logger.warning(f"Category ID must be integer: {category['id']}")
            return False
        
        # Validate type is string
        if not isinstance(category['type'], str):
            self.logger.warning(f"Category type must be string: {category['type']}")
            return False
        
        # Ensure keywords is a list
        if 'keywords' in category and not isinstance(category['keywords'], list):
            self.logger.warning(f"Category keywords must be list: {category['keywords']}")
            return False
        
        return True
    
    def create_sample_categories(self) -> List[Dict[str, Any]]:
        """
        Create a small set of sample categories for testing
        
        Returns:
            List of sample category dictionaries
        """
        return [
            {
                "id": 1,
                "name": "Climate Action",
                "type": "issue",
                "description": "Environmental protection and climate change action",
                "keywords": ["climate", "environment", "green", "renewable", "carbon"],
                "success_count": 10,
                "total_usage_count": 15,
                "metadata": {"priority_level": "high"}
            },
            {
                "id": 2,
                "name": "Healthcare Access",
                "type": "issue", 
                "description": "Healthcare coverage and medical access",
                "keywords": ["healthcare", "medical", "insurance", "coverage", "health"],
                "success_count": 12,
                "total_usage_count": 18,
                "metadata": {"priority_level": "high"}
            },
            {
                "id": 101,
                "name": "Progressive Champion",
                "type": "candidate_attribute",
                "description": "Strong progressive positions",
                "keywords": ["progressive", "liberal", "reform", "change", "activist"],
                "success_count": 8,
                "total_usage_count": 12,
                "metadata": {"political_spectrum": "progressive"}
            }
        ]


# Global category loader instance
_category_loader_instance: Optional[CategoryLoader] = None


def get_category_loader() -> CategoryLoader:
    """
    Get or create the global category loader instance
    
    Returns:
        CategoryLoader instance
    """
    global _category_loader_instance
    
    if _category_loader_instance is None:
        _category_loader_instance = CategoryLoader()
    
    return _category_loader_instance
