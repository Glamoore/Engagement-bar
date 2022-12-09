window.concured = window.concured || {
  key: null,
  id: null,
  insertionPoint: null,
  init: async function init(
    { elementSelector } = { elementSelector: ".concured" }
  ) {
    // Insertion point
    const output = document.querySelector(elementSelector);
    this.insertionPoint = output;

    // Gettting data attributes
    const {
      dataConcuredUi = "bar",
      dataConcuredColumns = "3",
      dataConcuredScroll = "600",
    } = output.dataset;

    this.barConfiguration = dataConcuredUi;

    let numberOfItems = Number(dataConcuredScroll);
    if (Number.isNaN(numberOfItems)) {
      console.error(`'data-concured-scroll' must be an integer'`);
      numberOfItems = 600;
    }

    let numberOfColumns = Number(dataConcuredColumns);

    if (Number.isNaN(numberOfColumns)) {
      console.error(`'data-concured-columns' must be an integer'`);
      numberOfColumns = 3;
    }

    this.columns = numberOfColumns;

    // Insertion HTML string
    const startHtml = `
    <div id="bar" class="${dataConcuredUi}">
        <a href="#recommendations" aria-expanded="true" aria-controls="collapsable" class="bar-toggle" aria-label="expands and collapses the recommendation bar">
          <header class="bar-header">
            <h2 class="bar-heading">Recommended</h2>
            <i class="fa-solid fa-angle-up expand-arrow"></i>
          </header>
        </a>
        <div class="collapsable">
          <ol class="recommendations" ${
            window.innerWidth > 700
              ? `style="grid-template-columns: repeat(${numberOfColumns}, 1fr)"`
              : ""
          }" >
    `;

    let recsHtml = "";

    const endHtml = `
        </ol>
      </div>
    </div>
    `;

    // Example of the API request the client would need to make to access the Concured Engagement Bar.
    // const url = `${gateway}/v1/recommendations?id=${this.id}&key=${this.key}`

    // API request and output
    const url = "/response.json";

    try {
      const response = await fetch(url);
      const result = await response.json();
      const recommendations = result.recommendation_content;

      for (const recommendation of recommendations) {
        const { url, text, images } = recommendation;
        const { url: imgurl, title } = images[0];

        recsHtml += `
        <li class='recommendation'>
          <a href='${url}' class="recommend-link">${text}</a>
          <img class='recommendation-img' src=${imgurl} alt="${title}"/>
        </li>`;
      }
      output.innerHTML = startHtml + recsHtml + endHtml;
    } catch (error) {
      console.log("error", error);
      output.innerHTML = "<p>Error loading bar</p>";
    }

    const mediaQuery = "(max-width: 700px)";
    const mediaQueryList = window.matchMedia(mediaQuery);
    const recommendations = output.querySelector(".recommendations");

    mediaQueryList.addEventListener("change", (event) => {
      console.log(window.innerWidth);
      if (event.matches) {
        recommendations.style.gridTemplateColumns = `1fr`;
      } else {
        recommendations.style.gridTemplateColumns = `repeat(${numberOfColumns}, 1fr)`;
      }
    });

    const collapsable = output.querySelector(".collapsable");
    const height = collapsable.scrollHeight;

    const toggleButton = output.querySelector(".bar-toggle");
    const expandArrow = toggleButton.querySelector(".expand-arrow");
    const openIcon = "fa-angle-down";
    const closeIcon = "fa-angle-up";

    toggleButton.addEventListener("click", (e) => {
      const isOpen = toggleButton.getAttribute("aria-expanded") === "true";
      if (isOpen) {
        this.closeBar();
        toggleButton.setAttribute("aria-expanded", "false");
        expandArrow.classList.replace(closeIcon, openIcon);
      } else {
        this.openBar(height);
        toggleButton.setAttribute("aria-expanded", "true");
        expandArrow.classList.replace(openIcon, closeIcon);
      }
    });
  },
  // Hide and show engagement bar
  openBar(height) {
    const { insertionPoint } = this;
    const openableArea = insertionPoint.querySelector(".collapsable");
    openableArea.style.height = `${height}px`;
  },
  closeBar() {
    const { insertionPoint } = this;
    const openableArea = insertionPoint.querySelector(".collapsable");
    openableArea.style.height = 0;
  },
};