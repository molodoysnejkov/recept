const API = "https://www.themealdb.com/api/json/v1/1";

const recipesGrid = document.getElementById("recipesGrid");
const categoriesList = document.getElementById("categoriesList");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const randomBtn = document.getElementById("randomBtn");

const modal = document.getElementById("recipeModal");
const closeModal = document.getElementById("closeModal");

const modalImage = document.getElementById("modalImage");
const modalTitle = document.getElementById("modalTitle");
const modalCategory = document.getElementById("modalCategory");
const modalArea = document.getElementById("modalArea");
const ingredients = document.getElementById("ingredients");
const instructions = document.getElementById("instructions");
const youtubeLink = document.getElementById("youtubeLink");

const recipeCount = document.getElementById("recipeCount");


let allRecipes = [];


async function loadRecipes() {

    recipesGrid.innerHTML = `
        <div class="loading">
            Загружаем рецепты...
        </div>
    `;

    try {

        const letters = ["a", "b", "c"];

        const requests = letters.map(letter =>
            fetch(`${API}/search.php?f=${letter}`)
                .then(response => response.json())
        );

        const results = await Promise.all(requests);

        let meals = [];

        results.forEach(result => {

            if (result.meals) {
                meals.push(...result.meals);
            }

        });

        allRecipes = meals;

        showRecipes(allRecipes);

    } catch (error) {

        recipesGrid.innerHTML = `
            <div class="loading">
                Не удалось загрузить рецепты.
            </div>
        `;

        console.error(error);
    }
}



function showRecipes(recipes) {

    recipesGrid.innerHTML = "";

    recipeCount.textContent =
        `${recipes.length} рецептов`;

    if (!recipes.length) {

        recipesGrid.innerHTML = `
            <div class="loading">
                Ничего не найдено.
            </div>
        `;

        return;
    }

    recipes.forEach(recipe => {

        const card = document.createElement("article");

        card.className = "card";

        card.innerHTML = `
            <img
                src="${recipe.strMealThumb}"
                alt="${recipe.strMeal}"
            >

            <div class="card-info">

                <p class="card-category">
                    Рецепт
                </p>

                <h3>
                    ${recipe.strMeal}
                </h3>

                <p class="card-area">
                    Открыть рецепт →
                </p>

            </div>
        `;

        card.addEventListener("click", () => {
            openRecipe(recipe.idMeal);
        });

        recipesGrid.appendChild(card);
    });
}



async function searchRecipes() {

    const query = searchInput.value.trim();

    if (!query) {

        showRecipes(allRecipes);

        return;
    }

    recipesGrid.innerHTML = `
        <div class="loading">
            Ищем...
        </div>
    `;

    try {

        const response = await fetch(
            `${API}/search.php?s=${encodeURIComponent(query)}`
        );

        const data = await response.json();

        showRecipes(data.meals || []);

    } catch (error) {

        recipesGrid.innerHTML = `
            <div class="loading">
                Ошибка поиска.
            </div>
        `;

        console.error(error);
    }
}


searchBtn.addEventListener("click", searchRecipes);


searchInput.addEventListener("keydown", event => {

    if (event.key === "Enter") {
        searchRecipes();
    }

});



async function loadCategories() {

    try {

        const response =
            await fetch(`${API}/categories.php`);

        const data = await response.json();

        data.categories.forEach(category => {

            const button = document.createElement("button");

            button.className = "category";

            button.textContent = category.strCategory;

            button.addEventListener("click", () => {

                document
                    .querySelectorAll(".category")
                    .forEach(item => {
                        item.classList.remove("active");
                    });

                button.classList.add("active");

                loadCategory(category.strCategory);
            });

            categoriesList.appendChild(button);

        });

    } catch (error) {

        console.error(error);

    }
}



async function loadCategory(category) {

    recipesGrid.innerHTML = `
        <div class="loading">
            Загружаем категорию...
        </div>
    `;

    try {

        const response = await fetch(
            `${API}/filter.php?c=${encodeURIComponent(category)}`
        );

        const data = await response.json();

        const recipes = data.meals || [];

        recipeCount.textContent =
            `${recipes.length} рецептов`;

        recipesGrid.innerHTML = "";

        recipes.forEach(recipe => {

            const card = document.createElement("article");

            card.className = "card";

            card.innerHTML = `
                <img
                    src="${recipe.strMealThumb}"
                    alt="${recipe.strMeal}"
                >

                <div class="card-info">

                    <p class="card-category">
                        ${category}
                    </p>

                    <h3>
                        ${recipe.strMeal}
                    </h3>

                    <p class="card-area">
                        Открыть рецепт →
                    </p>

                </div>
            `;

            card.addEventListener("click", () => {
                openRecipe(recipe.idMeal);
            });

            recipesGrid.appendChild(card);

        });

    } catch (error) {

        console.error(error);

    }
}




async function openRecipe(id) {

    try {

        const response =
            await fetch(`${API}/lookup.php?i=${id}`);

        const data = await response.json();

        const recipe = data.meals[0];

        modalImage.src = recipe.strMealThumb;
        modalImage.alt = recipe.strMeal;

        modalTitle.textContent = recipe.strMeal;

        modalCategory.textContent =
            recipe.strCategory || "Рецепт";

        modalArea.textContent =
            recipe.strArea
                ? `Кухня: ${recipe.strArea}`
                : "";

        instructions.textContent =
            recipe.strInstructions || "Инструкция отсутствует.";

        ingredients.innerHTML = "";

        for (let i = 1; i <= 20; i++) {

            const ingredient =
                recipe[`strIngredient${i}`];

            const measure =
                recipe[`strMeasure${i}`];

            if (ingredient && ingredient.trim()) {

                const li = document.createElement("li");

                li.textContent =
                    `${ingredient} — ${measure || ""}`;

                ingredients.appendChild(li);
            }
        }


        if (recipe.strYoutube) {

            youtubeLink.style.display = "inline-block";

            youtubeLink.href =
                recipe.strYoutube;

        } else {

            youtubeLink.style.display = "none";

        }


        modal.classList.add("show");

    } catch (error) {

        console.error(error);

    }
}



randomBtn.addEventListener("click", async () => {

    try {

        const response =
            await fetch(`${API}/random.php`);

        const data = await response.json();

        const recipe = data.meals[0];

        openRecipe(recipe.idMeal);

    } catch (error) {

        console.error(error);

    }

});



closeModal.addEventListener("click", () => {

    modal.classList.remove("show");

});


modal.addEventListener("click", event => {

    if (event.target === modal) {

        modal.classList.remove("show");

    }

});



loadRecipes();

loadCategories();