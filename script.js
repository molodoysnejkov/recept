const API = "https://www.themealdb.com/api/json/v1/1";

const recipesGrid = document.getElementById("recipesGrid");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const randomBtn = document.getElementById("randomBtn");

const categoriesList = document.getElementById("categoriesList");
const recipeCount = document.getElementById("recipeCount");

const modal = document.getElementById("recipeModal");
const closeModal = document.getElementById("closeModal");

const modalImage = document.getElementById("modalImage");
const modalTitle = document.getElementById("modalTitle");
const modalCategory = document.getElementById("modalCategory");
const modalArea = document.getElementById("modalArea");
const ingredients = document.getElementById("ingredients");
const instructions = document.getElementById("instructions");
const youtubeLink = document.getElementById("youtubeLink");

const translations = {
    "паста": "pasta",
    "макароны": "pasta",
    "спагетти": "spaghetti",
    "пицца": "pizza",
    "курица": "chicken",
    "курка": "chicken",
    "мясо": "beef",
    "говядина": "beef",
    "свинина": "pork",
    "рыба": "fish",
    "лосось": "salmon",
    "рис": "rice",
    "салат": "salad",
    "суп": "soup",
    "торт": "cake",
    "печенье": "cookie",
    "яйцо": "egg",
    "яйца": "egg",
    "картошка": "potato",
    "картофель": "potato",
    "картопля": "potato",
    "сыр": "cheese",
    "сир": "cheese",
    "хлеб": "bread",
    "хліб": "bread",
    "десерт": "dessert"
};

async function loadRecipes() {
    recipesGrid.innerHTML = `
        <div class="loading">
            Загружаем рецепты...
        </div>
    `;

    try {
        const response = await fetch(`${API}/search.php?s=`);
        const data = await response.json();

        showRecipes(data.meals || []);
    } catch (error) {
        recipesGrid.innerHTML = `
            <div class="empty-state">
                <h3>Ошибка загрузки</h3>
                <p>Проверь подключение к интернету.</p>
            </div>
        `;
    }
}

function showRecipes(meals) {
    recipesGrid.innerHTML = "";

    if (!meals || meals.length === 0) {
        recipesGrid.innerHTML = `
            <div class="empty-state">
                <h3>Ничего не найдено</h3>
                <p>Попробуй изменить запрос.</p>
            </div>
        `;

        recipeCount.textContent = "0 рецептов";
        return;
    }

    recipeCount.textContent = `${meals.length} рецептов`;

    meals.forEach(meal => {
        const card = document.createElement("div");

        card.className = "recipe-card";

        card.innerHTML = `
            <img class="recipe-image" src="${meal.strMealThumb}" alt="${meal.strMeal}">

            <div class="recipe-info">
                <p class="recipe-category">
                    ${meal.strCategory || "Рецепт"}
                </p>

                <h3 class="recipe-title">
                    ${meal.strMeal}
                </h3>

                <p class="recipe-description">
                    Кухня: ${meal.strArea || "Не указана"}
                </p>
            </div>
        `;

        card.addEventListener("click", () => {
            openRecipe(meal.idMeal);
        });

        recipesGrid.appendChild(card);
    });
}

async function searchRecipes() {
    let query = searchInput.value.trim().toLowerCase();

    if (!query) {
        loadRecipes();
        return;
    }

    if (translations[query]) {
        query = translations[query];
    }

    recipesGrid.innerHTML = `
        <div class="loading">
            Ищем рецепты...
        </div>
    `;

    try {
        const response = await fetch(
            `${API}/search.php?s=${encodeURIComponent(query)}`
        );

        const data = await response.json();

        showRecipes(data.meals || []);

        document.getElementById("recipes").scrollIntoView({
            behavior: "smooth"
        });
    } catch (error) {
        recipesGrid.innerHTML = `
            <div class="empty-state">
                <h3>Ошибка поиска</h3>
                <p>Попробуй ещё раз.</p>
            </div>
        `;
    }
}

async function loadCategories() {
    try {
        const response = await fetch(`${API}/categories.php`);
        const data = await response.json();

        data.categories.forEach(category => {
            const button = document.createElement("button");

            button.className = "category";
            button.textContent = category.strCategory;

            button.addEventListener("click", () => {
                document.querySelectorAll(".category").forEach(btn => {
                    btn.classList.remove("active");
                });

                button.classList.add("active");

                loadCategory(category.strCategory);
            });

            categoriesList.appendChild(button);
        });
    } catch (error) {
        console.log(error);
    }
}

async function loadCategory(category) {
    recipesGrid.innerHTML = `
        <div class="loading">
            Загружаем рецепты...
        </div>
    `;

    try {
        const response = await fetch(
            `${API}/filter.php?c=${encodeURIComponent(category)}`
        );

        const data = await response.json();

        showRecipes(data.meals || []);

        document.getElementById("recipes").scrollIntoView({
            behavior: "smooth"
        });
    } catch (error) {
        console.log(error);
    }
}

async function randomRecipe() {
    try {
        randomBtn.textContent = "Загрузка...";

        const response = await fetch(`${API}/random.php`);
        const data = await response.json();

        if (data.meals && data.meals.length > 0) {
            openRecipe(data.meals[0].idMeal);
        }
    } catch (error) {
        console.log(error);
    }

    randomBtn.textContent = "Случайный рецепт";
}

async function openRecipe(id) {
    try {
        const response = await fetch(`${API}/lookup.php?i=${id}`);
        const data = await response.json();

        const meal = data.meals[0];

        modalImage.src = meal.strMealThumb;
        modalImage.alt = meal.strMeal;

        modalTitle.textContent = meal.strMeal;
        modalCategory.textContent = meal.strCategory || "Рецепт";
        modalArea.textContent = `Кухня: ${meal.strArea || "Не указана"}`;

        ingredients.innerHTML = "";

        for (let i = 1; i <= 20; i++) {
            const ingredient = meal[`strIngredient${i}`];
            const measure = meal[`strMeasure${i}`];

            if (ingredient && ingredient.trim() !== "") {
                const li = document.createElement("li");

                li.textContent = `${ingredient} — ${measure || ""}`;

                ingredients.appendChild(li);
            }
        }

        instructions.textContent =
            meal.strInstructions || "Инструкция отсутствует.";

        if (meal.strYoutube) {
            youtubeLink.href = meal.strYoutube;
            youtubeLink.style.display = "inline-block";
        } else {
            youtubeLink.style.display = "none";
        }

        modal.classList.add("active");
    } catch (error) {
        console.log(error);
    }
}

closeModal.addEventListener("click", () => {
    modal.classList.remove("active");
});

modal.addEventListener("click", event => {
    if (event.target === modal) {
        modal.classList.remove("active");
    }
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        modal.classList.remove("active");
    }
});

searchBtn.addEventListener("click", searchRecipes);

searchInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        searchRecipes();
    }
});

randomBtn.addEventListener("click", randomRecipe);

const allButton = document.querySelector('[data-category="all"]');

allButton.addEventListener("click", () => {
    document.querySelectorAll(".category").forEach(btn => {
        btn.classList.remove("active");
    });

    allButton.classList.add("active");

    loadRecipes();
});

loadRecipes();
loadCategories();
