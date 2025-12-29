const API_BASE = 'https://www.themealdb.com/api/json/v1/1';
const API_SEARCH_ALL = `${API_BASE}/search.php?s=`;
const API_SEARCH = (foodName) => `${API_BASE}/search.php?s=${foodName}`;
const API_DETAIL = (id) => `${API_BASE}/lookup.php?i=${id}`;

// DOM Elements
const loadingOverlay = document.getElementById('loadingOverlay');
const recipesContainer = document.getElementById('recipesContainer');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const scrollTopBtn = document.getElementById('scrollTopBtn');
const recipeModal = new bootstrap.Modal(document.getElementById('recipeModal'));
const modalBody = document.getElementById('modalBody');

// Show/Hide Loading
function showLoading() {
    loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
    loadingOverlay.classList.add('hidden');
}

// Fetch all meals on page load
async function loadAllMeals() {
    showLoading();
    try {
        const response = await fetch(API_SEARCH_ALL);
        const data = await response.json();
        displayRecipes(data.meals);
    } catch (error) {
        console.error('Error loading meals:', error);
        recipesContainer.innerHTML = '<div class="col-12"><div class="no-results"><i class="fas fa-exclamation-circle"></i><h3>Error loading recipes</h3><p>Please try again later.</p></div></div>';
    } finally {
        hideLoading();
    }
}

// Search meals
async function searchMeals(query) {
    showLoading();
    try {
        const response = await fetch(API_SEARCH(query));
        const data = await response.json();
        displayRecipes(data.meals);
    } catch (error) {
        console.error('Error searching meals:', error);
        recipesContainer.innerHTML = '<div class="col-12"><div class="no-results"><i class="fas fa-exclamation-circle"></i><h3>Error searching recipes</h3><p>Please try again.</p></div></div>';
    } finally {
        hideLoading();
    }
}

// Display recipes
function displayRecipes(meals) {
    recipesContainer.innerHTML = '';
    
    if (!meals || meals.length === 0) {
        recipesContainer.innerHTML = '<div class="col-12"><div class="no-results"><i class="fas fa-search"></i><h3>No recipes found</h3><p>Try searching for something else.</p></div></div>';
        return;
    }

    meals.forEach(meal => {
        const description = meal.strInstructions.substring(0, 100) + '...';
        const card = `
            <div class="col-lg-3 col-md-6 mb-4">
                <div class="recipe-card">
                    <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="recipe-image">
                    <div class="recipe-content">
                        <h3 class="recipe-title">${meal.strMeal}</h3>
                        <p class="recipe-description truncate-3 ">${description}</p>
                        <button class="view-details-btn" onclick="viewRecipeDetail('${meal.idMeal}')">VIEW DETAILS</button>
                    </div>
                </div>
            </div>
        `;
        recipesContainer.innerHTML += card;
    });
}

// View recipe detail
async function viewRecipeDetail(mealId) {
    showLoading();
    try {
        const response = await fetch(API_DETAIL(mealId));
        const data = await response.json();
        const meal = data.meals[0];
        
        // Get ingredients
        let ingredients = '';
        for (let i = 1; i <= 20; i++) {
            const ingredient = meal[`strIngredient${i}`];
            const measure = meal[`strMeasure${i}`];
            if (ingredient && ingredient.trim() !== '') {
                ingredients += `<div class="ingredient-item"><strong>${ingredient}</strong> - ${measure}</div>`;
            }
        }

        // Build modal content
        const modalContent = `
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}" height="100" class="img-fluid mb-3">
            <h3>${meal.strMeal}</h3>
            <p>${meal.strInstructions}</p>
        `;
        
        modalBody.innerHTML = modalContent;
        recipeModal.show();
    } catch (error) {
        console.error('Error loading recipe details:', error);
        modalBody.innerHTML = '<div class="alert alert-danger">Error loading recipe details. Please try again.</div>';
        recipeModal.show();
    } finally {
        hideLoading();
    }
}

// Search functionality
searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) {
        searchMeals(query);
    } else {
        loadAllMeals();
    }
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query) {
            searchMeals(query);
        } else {
            loadAllMeals();
        }
    }
});

// Scroll to top functionality
window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        scrollTopBtn.classList.add('show');
    } else {
        scrollTopBtn.classList.remove('show');
    }
});

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Load meals on page load
window.addEventListener('DOMContentLoaded', loadAllMeals);

// Make viewRecipeDetail available globally
window.viewRecipeDetail = viewRecipeDetail;