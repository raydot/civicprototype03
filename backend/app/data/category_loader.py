"""
Category data loader for VoterPrime political categories
Handles loading and initializing political categories from PostgreSQL database
"""
import json
from pathlib import Path
from typing import List, Dict, Any, Optional
from sqlalchemy import create_engine, text
from ..utils.logging import structured_logger
from ..config import settings


class CategoryLoader:
    """Loads and manages political category data for VoterPrime"""
    
    def __init__(self, data_dir: Optional[Path] = None, db_engine=None):
        if data_dir is None:
            # Default to data directory relative to this file
            self.data_dir = Path(__file__).parent
        else:
            self.data_dir = Path(data_dir)
        
        self.logger = structured_logger
        self.db_engine = db_engine or create_engine(settings.database_url)
        self._cache = None  # In-memory cache of policy terms
    
    def load_political_categories(self, filename: str = "political_categories.json") -> List[Dict[str, Any]]:
        """
        Load policy terms from PostgreSQL database (replaces JSON file loading)
        
        Args:
            filename: Ignored - kept for backwards compatibility
            
        Returns:
            List of policy term dictionaries
        """
        return self.load_policy_terms_from_db()
    
    def load_policy_terms_from_db(self, force_refresh: bool = False) -> List[Dict[str, Any]]:
        """
        Load policy terms from PostgreSQL database with in-memory caching
        
        Args:
            force_refresh: If True, bypass cache and reload from database
            
        Returns:
            List of policy term dictionaries
        """
        # Return cached data if available and not forcing refresh
        if self._cache is not None and not force_refresh:
            self.logger.info(f"Returning {len(self._cache)} policy terms from cache")
            return self._cache
        
        try:
            self.logger.info("Loading policy terms from PostgreSQL database...")
            
            with self.db_engine.connect() as conn:
                result = conn.execute(text("""
                    SELECT 
                        id,
                        term as name,
                        policy_area,
                        description,
                        keywords,
                        embedding,
                        success_count,
                        total_usage_count,
                        is_active
                    FROM policy_terms
                    WHERE is_active = true
                    ORDER BY id
                """))
                
                policy_terms = []
                for row in result:
                    # Convert database row to dictionary format expected by CategoryMatcher
                    policy_term = {
                        'id': row[0],
                        'name': row[1],  # term name
                        'type': 'policy_term',  # All Congress.gov terms are policy terms
                        'policy_area': row[2],
                        'description': row[3],
                        'keywords': row[4] if row[4] else [],
                        'embedding': list(row[5]) if row[5] else None,  # Convert pgvector to list
                        'success_count': row[6] or 0,
                        'total_usage_count': row[7] or 0,
                        'metadata': {
                            'policy_area': row[2]
                        }
                    }
                    policy_terms.append(policy_term)
            
            self.logger.info(f"Loaded {len(policy_terms)} policy terms from database")
            
            # Cache the results
            self._cache = policy_terms
            
            return policy_terms
        
        except Exception as e:
            self.logger.error(f"Failed to load policy terms from database: {str(e)}")
            raise RuntimeError(f"Policy term loading failed: {str(e)}")
    
    def load_categories_by_type(self, category_type: str, filename: str = "political_categories.json") -> List[Dict[str, Any]]:
        """
        Load policy terms filtered by type
        
        Args:
            category_type: Type of categories to load (all policy terms are 'policy_term')
            filename: Ignored - kept for backwards compatibility
            
        Returns:
            List of policy term dictionaries of the specified type
        """
        all_terms = self.load_policy_terms_from_db()
        filtered_terms = [term for term in all_terms if term.get('type') == category_type]
        
        self.logger.info(f"Loaded {len(filtered_terms)} policy terms of type '{category_type}'")
        
        return filtered_terms
    
    def load_policy_terms_by_area(self, policy_area: str) -> List[Dict[str, Any]]:
        """
        Load policy terms filtered by policy area (e.g., 'Health', 'Education')
        
        Args:
            policy_area: Policy area to filter by
            
        Returns:
            List of policy term dictionaries for the specified area
        """
        all_terms = self.load_policy_terms_from_db()
        filtered_terms = [term for term in all_terms if term.get('policy_area') == policy_area]
        
        self.logger.info(f"Loaded {len(filtered_terms)} policy terms for area '{policy_area}'")
        
        return filtered_terms
    
    def get_category_types(self, filename: str = "political_categories.json") -> List[str]:
        """
        Get all available category types
        
        Args:
            filename: Ignored - kept for backwards compatibility
            
        Returns:
            List of unique category types (will be ['policy_term'])
        """
        return ['policy_term']
    
    def get_policy_areas(self) -> List[str]:
        """
        Get all available policy areas from Congress.gov taxonomy
        
        Returns:
            List of unique policy areas (e.g., 'Health', 'Education', etc.)
        """
        policy_terms = self.load_policy_terms_from_db()
        areas = list(set(term.get('policy_area', 'Unknown') for term in policy_terms))
        
        return sorted(areas)
    
    def refresh_cache(self) -> None:
        """
        Force refresh of the in-memory cache from database
        Useful after database updates
        """
        self.logger.info("Refreshing policy terms cache from database...")
        self._cache = None
        self.load_policy_terms_from_db(force_refresh=True)
    
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
