// Move categoryLabels here
const categoryLabels = {
    categoryA: 'NYTTJANDE',
    categoryB: 'VÄLMÅENDE',
    categoryC: 'INKLUDERING',
    categoryD: 'BETEENDEFÖRÄNDRING',
    categoryE: 'BIODIVERSITET',
    categoryF: 'KLIMATAVTRYCK',
    categoryG: 'MARK',
    categoryH: 'ENERGI',
    categoryI: 'PENGAR',
    categoryJ: 'RESURSUTNYTTJANDE',
    categoryK: 'RESILIENS',
    categoryL: 'SKÖNHET',
    categoryM: 'FLEXIBILITET',
    categoryN: 'ÄGANDESKAP',
    categoryO: 'DEMONTERBARHET'
};


const pages = ['project.html', 'vision.html', 'step1.html', 'step2.html', 'step3.html', './summary.html']; // Ensure correct path to summary.html
let currentPage = 0;
let formData = {};
let isTransitioning = false; // Flag to track if a transition is in progress

// Make selectNumber globally accessible
function selectNumber(element, categoryId) {
    const numberOptions = element.parentElement.querySelectorAll('span');
    numberOptions.forEach(option => option.classList.remove('selected'));
    element.classList.add('selected');
    const input = document.getElementById(categoryId);
    if (input) {
        input.value = element.textContent;
        formData[categoryId] = element.textContent; // Update formData with the selected value
        
        // Also update the localStorage directly to ensure consistency
        localStorage.setItem(categoryId, element.textContent);
    }
    
    // Always update chart after value changes
    updateChart();
    saveInputs();
}

// Make selectNumber globally accessible
window.selectNumber = selectNumber;

async function loadPage(index, direction = 'forward') {
  if (isTransitioning) return; // Prevent multiple transitions
  isTransitioning = true;

  const container = document.getElementById('form-container');
  const oldPage = container.firstElementChild;

  try {
    const res = await fetch(pages[index]);
    if (!res.ok) throw new Error(`Failed to load ${pages[index]}`);
    const html = await res.text();

    const newDiv = document.createElement('div');
    newDiv.classList.add('form-page');
    newDiv.innerHTML = html;

    if (direction === 'forward') {
      newDiv.classList.add('slide-up-in');
      if (oldPage) {
        oldPage.classList.remove('active'); // Ensure old page is not active
        oldPage.classList.remove('slide-down-in', 'slide-up-in'); // Remove any lingering classes
        oldPage.classList.add('slide-up-out'); // Apply slide-up-out to current page
      }
    } else {
      newDiv.classList.add('slide-down-in');
      if (oldPage) {
        oldPage.classList.remove('active'); // Ensure old page is not active
        oldPage.classList.remove('slide-up-in', 'slide-down-in'); // Remove any lingering classes
        oldPage.classList.add('slide-down-out'); // Apply slide-down-out to current page
      }
    }

    container.appendChild(newDiv);

    setTimeout(() => {
      newDiv.classList.add('active'); // Mark the new page as active
      if (oldPage) container.removeChild(oldPage); // Remove old page after animation
      isTransitioning = false; // Reset the flag after transition

      // Dynamically adjust the height of the wrapper to fit the content
      const formWrapper = document.getElementById('form-wrapper');
      const formContainer = document.getElementById('form-container');
      formWrapper.style.height = formContainer.scrollHeight + 'px'; // Adjust height to fit content

      // Reattach toggleText event listeners for dynamically loaded content
      reattachToggleListeners();

      // Reattach selectNumber event listeners for dynamically loaded content
      document.querySelectorAll('.number-options span').forEach(span => {
          span.addEventListener('click', function () {
              const categoryId = this.parentElement.getAttribute('id').replace('numberOptions', 'category');
              selectNumber(this, categoryId);
          });
      });

      // Restore saved inputs for the current page
      restoreInputs();
   
      // Reset progress for the current page and update the chart
      updateChart();
      updateSummaryChart();

    }, 500);

    document.getElementById('exportBtn').style.display = (index === pages.length - 1) ? 'inline-block' : 'none';
    currentPage = index;

  } catch (error) {
    console.error(error);
    alert(`Error loading page: ${pages[index]}`);
    isTransitioning = false;
  }
}

function nextPage() {
  saveInputs();
  if (currentPage < pages.length - 1) loadPage(currentPage + 1, 'forward');
}

function prevPage() {
  saveInputs();
  if (currentPage > 0) loadPage(currentPage - 1, 'backward');
}

function updateSummaryChart() {
    // Only create the chart if we're on the summary page
    if (currentPage !== pages.length - 1) {
        return; // Don't render summary chart if not on summary page
    }
    
    const chartDom = document.getElementById('roseChart');
    if (!chartDom) {
        console.error('Rose chart container not found.');
        return;
    }

    // Check if this chart already has an instance
    let myChart = echarts.getInstanceByDom(chartDom);
    
    // If no instance exists, initialize it
    if (!myChart) {
        myChart = echarts.init(chartDom);
    }
    
    myChart.clear();

    // Add support for action plan textarea
    const actionPlan = document.getElementById('actionPlan');
    if (actionPlan) {
        // Load saved data
        actionPlan.value = formData['actionPlan'] || localStorage.getItem('actionPlan') || '';
        
        // Set up event listener to save data
        actionPlan.addEventListener('input', function() {
            formData['actionPlan'] = this.value;
            localStorage.setItem('actionPlan', this.value);
            saveInputs();
        });
    }

    const categories = [
        { name: 'NYTTJANDE', value: parseFloat(formData['categoryA'] || localStorage.getItem('categoryA') || 0) },
        { name: 'VÄLMÅENDE', value: parseFloat(formData['categoryB'] || localStorage.getItem('categoryB') || 0) },
        { name: 'INKLUDERING', value: parseFloat(formData['categoryC'] || localStorage.getItem('categoryC') || 0) },
        { name: 'BETEENDEFÖRÄNDRING', value: parseFloat(formData['categoryD'] || localStorage.getItem('categoryD') || 0) },
        { name: 'BIODIVERSITET', value: parseFloat(formData['categoryE'] || localStorage.getItem('categoryE') || 0) },
        { name: 'KLIMATAVTRYCK', value: parseFloat(formData['categoryF'] || localStorage.getItem('categoryF') || 0) },
        { name: 'MARK', value: parseFloat(formData['categoryG'] || localStorage.getItem('categoryG') || 0) },
        { name: 'ENERGI', value: parseFloat(formData['categoryH'] || localStorage.getItem('categoryH') || 0) },
        { name: 'PENGAR', value: parseFloat(formData['categoryI'] || localStorage.getItem('categoryI') || 0) },
        { name: 'RESURSUTNYTTJANDE', value: parseFloat(formData['categoryJ'] || localStorage.getItem('categoryJ') || 0) },
        { name: 'RESILIENS', value: parseFloat(formData['categoryK'] || localStorage.getItem('categoryK') || 0) },
        { name: 'SKÖNHET', value: parseFloat(formData['categoryL'] || localStorage.getItem('categoryL') || 0) },
        { name: 'FLEXIBILITET', value: parseFloat(formData['categoryM'] || localStorage.getItem('categoryM') || 0) },
        { name: 'ÄGANDESKAP', value: parseFloat(formData['categoryN'] || localStorage.getItem('categoryN') || 0) },
        { name: 'DEMONTERBARHET', value: parseFloat(formData['categoryO'] || localStorage.getItem('categoryO') || 0) }
    ];

   // Sortera kategorierna alfabetiskt
   const sortedCategories = [...categories].sort((a, b) => a.name.localeCompare(b.name));
   console.log("Sorted categories:", sortedCategories);

   // Hitta topp 3 kategorier baserat på högsta värde
   const topCategories = [...categories].sort((a, b) => b.value - a.value).slice(0, 3);
   const topCategoriesList = document.getElementById('topCategoriesList');
   topCategories.forEach(category => {
       const listItem = document.createElement('li');
       listItem.textContent = `${category.name}: ${category.value}`;
       topCategoriesList.appendChild(listItem);
   });
   // Hitta kategorierna rankade 4-6
   const additionalCategories = [...categories].sort((a, b) => b.value - a.value).slice(3, 6);
   const additionalCategoriesList = document.getElementById('additionalCategoriesList');
   additionalCategories.forEach(category => {
       const listItem = document.createElement('li');
       listItem.textContent = `${category.name}: ${category.value}`;
       additionalCategoriesList.appendChild(listItem);
   });


    // Skapa en serie för maxvärdet med olika färger
    const maxSeries = categories.map(category => {
        let color;
        if (['Category A', 'Category B', 'Category C', 'Category D', 'Category E'].includes(category.name)) {
            color = '#e5e4e4'; // Ljusgrå färg
        } else if (['Category F', 'Category G', 'Category H', 'Category I', 'Category J'].includes(category.name)) {
            color = '#e2e2e1'; // Mörkare grå färg
        } else {
            color = '#dddddd'; // Ännu mörkare grå färg
        }
        return {
            name: category.name,
            value: 5,
            itemStyle: {
                color: color,
                borderColor: '#fff', // Remove white border by setting it to the same color
                borderWidth: 1
            }
        };
    });
    // Huvudfärger för varje intervall
    const mainColors = ['#8d9e7c', '#e0b34e', '#e0867c'];

    // Funktion för att generera färger med olika opaciteter
    function getColorWithOpacity(color, opacity) {
        const opacityHex = Math.round(opacity * 255).toString(16).padStart(2, '0');
        return color + opacityHex;
    }

    // Generera färger för Data-serien med olika opaciteter
    const dataColors = categories.map((category, index) => {
        let mainColor;
        let opacity;
        if (index < 5) {
            mainColor = mainColors[0];
            opacity = index * 0.2;
        } else if (index < 10) {
            mainColor = mainColors[1];
            opacity = (index - 5) * 0.2;
        } else {
            mainColor = mainColors[2];
            opacity = (index - 10) * 0.2;
        }
        return getColorWithOpacity(mainColor, 1 - opacity);
    });

    const option = {
        graphic: {
            type: 'group',
            left: 'center',
            top: 'center',
            children: [
                {
                    type: 'image',
                    style: {
                        image: 'data:image/svg+xml;base64,' + btoa(`
                            <svg id="Lager_1" data-name="Lager 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 33.95 44.19" preserveAspectRatio="xMidYMid meet">
                                <defs>
                                    <style>
                                        .cls-1 {
                                            fill: #4a4a4a;
                                        }
                                    </style>
                                </defs>
                                <path class="cls-1" d="M11.04,14.18l-1.18-3.24h-5.76l-1.18,3.24H0L5.44,0h3.2l5.4,14.18h-3ZM6.98,3.06l-1.96,5.36h3.92l-1.96-5.36Z"/>
                                <path class="cls-1" d="M30.87,14.18l-2.78-5.46h-1.44v5.46h-2.78V0h5.54c1.36,0,2.45.41,3.28,1.24.83.83,1.24,1.87,1.24,3.12,0,.99-.27,1.84-.81,2.55-.54.71-1.28,1.2-2.21,1.47l3.04,5.8h-3.08ZM26.65,6.34h2.24c.69,0,1.24-.18,1.63-.54.39-.36.59-.83.59-1.42s-.2-1.08-.59-1.44c-.39-.36-.94-.54-1.63-.54h-2.24v3.94Z"/>
                                <path class="cls-1" d="M23.15,32.63h-4.48v11.56h-2.78v-11.56h-4.48v-2.62h11.74v2.62Z"/>
                                <rect class="cls-1" y="20.79" width="33.95" height="2.62"/>
                            </svg>
                        `),
                        width: 35,
                        height: 45
                    }
                }
            ]
        },
        tooltip: {
            trigger: 'item',
            position: function (point, params, dom, rect, size) {
                // place tooltip centered above the mouse cursor with a fixed offset
                return [point[0] - rect.width / 2, point[1] - 50];
            },
            formatter: function (params) {
                // Visa endast tooltip för serien "Data"
                if (params.seriesName === 'Data') {
                    // Formatera texten så att första bokstaven är versal och resten gemener
                    const formattedName = params.name.charAt(0).toUpperCase() + params.name.slice(1).toLowerCase();
                    return `${formattedName}: ${params.value}`;
                }
                return ''; // Ingen tooltip för max value-serien
            },
            textStyle: {
                fontFamily: 'CircularStd-Bold', // Ändra till önskat typsnitt
                fontSize: 14, // Ändra till önskad storlek
                fontWeight: 'normal',
                color: '#000' // Ändra till önskad färg
            },
            backgroundColor: 'transparent', // Gör bakgrunden transparent
    borderColor: 'transparent', // Gör kantlinjen transparent
    shadowBlur: 0, // Ta bort skugga
    shadowColor: 'transparent', // Ta bort skugga
    shadowOffsetX: 0, // Ta bort skugga
    shadowOffsetY: 0 // Ta bort skugga
        },
        legend: {
            show: false
        },
        series: [
            {
                name: 'Max Value',
                type: 'pie',
                radius: ['10%', '80%'],
                roseType: 'area',
                avoidLabelOverlap: false,
                silent: true,
                itemStyle: {
                    borderRadius: 20,
                    borderColor: '#fff',
                    borderWidth: 1,
                    cursor: 'default'
                },
                label: {
                    show: false
                },
                emphasis: {
                    disabled: true,
                    itemStyle: {
                        cursor: 'default'
                    }
                },
                tooltip: {
                    show: false
                },
                data: maxSeries
            },
            {
                name: 'Data',
                type: 'pie',
                radius: ['10%', '70%'],
                roseType: 'area',
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 20,
                    borderColor: '#fff',
                    borderWidth: 1,
                    cursor: 'pointer'
                },
                label: {
                    show: false
                },
                emphasis: {
                    focus: 'series',
                    itemStyle: {
                        cursor: 'url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0iYmxhY2siIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTE2IDhDMTYgMTIuNDE4MyAxMi40MTgzIDggMTZDMy41ODE3IDE2IDAgMTIuNDE4MyAwIDhDMCAzLjU4MTcgMy41ODE3IDAgOCAwQzEyLjQxODMgMCAxNiAzLjU4MTcgMTYgOFoiIGZpbGw9ImJsYWNrIi8+PC9zdmc+), auto' // Pekaren blir en svart fylld cirkel vid hover på Data-serien
                    }
                },
                data: categories.map((category, index) => ({
                    ...category,
                    itemStyle: {
                        color: dataColors[index % dataColors.length] // Använd olika färger för varje tårtbit
                    }
                }))
            }
        ]
    };

    myChart.setOption(option, true);

    // Ensure the chart resizes dynamically on window resize
    window.addEventListener('resize', () => {
        if (myChart && !myChart.isDisposed()) {
            myChart.resize();
        }
    });

    // Notify when the chart is fully rendered
    myChart.on('finished', function () {
        console.log('Chart rendering finished.'); // Debugging log
        document.dispatchEvent(new Event('chartRendered')); // Dispatch custom event
    });

    // 🎯 Lägg till statiska etiketter runt diagrammet
    positionLabels(document.getElementById('labels-container'), categories);

    // Positionera etiketter vid start
    const labelsContainer = document.getElementById('labels-container');
    positionLabels(labelsContainer, categories);
    
    // Anropa funktionen igen när fönstret ändras för att behålla rätt positioner
    window.addEventListener('resize', () => {
        const labelsContainer = document.getElementById('labels-container');
        positionLabels(labelsContainer, categories);
        myChart.resize(); // Ensure the chart resizes dynamically
    });
}

// Define the positionLabels function
function positionLabels(labelsContainer, categories) {
    labelsContainer.innerHTML = ""; // Clear existing labels

    const radius = labelsContainer.clientWidth / 5.4; // Dynamically calculate radius
    const centerX = labelsContainer.clientWidth / 2;
    const centerY = labelsContainer.clientHeight / 2;

    categories.forEach((category, index) => {
        const angle = index * 24; // Each category takes up 24° (360° / 15)
        const adjustedAngle = angle +12; // Adjust to compensate for rotation

        const radians = (adjustedAngle - 90) * (Math.PI / 180); // -90 to start from the top

        const x = centerX + radius * Math.cos(radians);
        const y = centerY + radius * Math.sin(radians);

        const label = document.createElement('div');
        label.classList.add('category-label');
        label.textContent = category.name;

        // Position the text at the calculated coordinates
        label.style.left = `${x}px`;
        label.style.top = `${y}px`;

        // Rotate the text to follow the circle
        let textRotation = adjustedAngle;

        // Flip the text if upside down
        if (textRotation > 90 && textRotation < 270) {
            textRotation += 180;
        }

        label.style.transform = `translate(-50%, -50%) rotate(${textRotation}deg)`;

        labelsContainer.appendChild(label);
    });
}

// Create a helper function for chart operations
function updateProgressChart(container = document, forceReset = false) {
    // Don't show progress chart on certain pages
    if (currentPage === 0 || currentPage === 1 || currentPage === pages.length - 1) {
        const existingChart = document.getElementById('doughnutChart');
        if (existingChart) {
            existingChart.style.display = 'none';
        }
        return;
    }
    
    // Show the chart if it was previously hidden
    const existingChart = document.getElementById('doughnutChart');
    if (existingChart) {
        existingChart.style.display = 'block';
    }

    let chartContainer = container.querySelector('#doughnutChart');
    if (!chartContainer) {
        console.warn('Chart container not found in the current context. Creating a new one.');
        chartContainer = document.createElement('div');
        chartContainer.id = 'doughnutChart';
        chartContainer.style.width = '100%';
        chartContainer.style.height = '400px';
        container.appendChild(chartContainer);
    }

    // Get existing chart instance or create new one
    let chart = echarts.getInstanceByDom(chartContainer);
    if (!chart) {
        chart = echarts.init(chartContainer);
    }

    const totalCategories = 15; // Total number of categories across all pages
    
    // Calculate filled categories and percentage
    let totalFilled = 0;
    
    if (!forceReset) {
        // Parse stored progress or initialize empty object
        const storedProgress = JSON.parse(localStorage.getItem('progress')) || { page1: 0, page2: 0, page3: 0 };

        // Recalculate progress for the current page based on selected values
        const currentPageKey = `page${currentPage + 1}`;
        const currentPageInputs = container.querySelectorAll('.number-options span.selected');
        storedProgress[currentPageKey] = currentPageInputs.length;

        // Save updated progress to localStorage
        localStorage.setItem('progress', JSON.stringify(storedProgress));

        // Calculate total filled categories across all pages
        totalFilled = Object.values(storedProgress).reduce((sum, value) => sum + value, 0);
    }

    const percentage = Math.round((totalFilled / totalCategories) * 100);

    const option = {
        series: [
            {
                name: 'Background',
                type: 'pie',
                radius: ['50%', '70%'],
                avoidLabelOverlap: false,
                label: { show: false },
                labelLine: { show: false },
                data: [
                    { value: totalCategories, name: 'Background', itemStyle: { color: '#d3d3d3' } }
                ]
            },
            {
                name: 'Progress',
                type: 'pie',
                radius: ['50%', '70%'],
                avoidLabelOverlap: false,
                label: {
                    show: true,
                    position: 'center',
                    formatter: `${percentage}%`,
                    fontSize: 20,
                    fontWeight: 'bold'
                },
                labelLine: { show: false },
                data: [
                    { value: totalFilled, name: 'Filled', itemStyle: { color: '#000000' } },
                    { value: totalCategories - totalFilled, name: 'Empty', itemStyle: { color: 'transparent' } }
                ]
            }
        ]
    };

    chart.setOption(option, true);
    
    // Make sure chart resizes with window
    window.addEventListener('resize', () => {
        if (chart && !chart.isDisposed()) {
            chart.resize();
        }
    });
    
    return chart;
}

// Update the updateChart function to use the helper
function updateChart(container = document) {
    return updateProgressChart(container, false);
}

function restoreInputs(container = document) {
  const savedFormData = JSON.parse(localStorage.getItem('formData')) || {};
  Object.assign(formData, savedFormData); // Merge saved data into formData

  // Ensure category values are properly loaded from both sources
  for (let i = 65; i <= 79; i++) { // ASCII codes for A-O
    const categoryKey = 'category' + String.fromCharCode(i);
    formData[categoryKey] = formData[categoryKey] || localStorage.getItem(categoryKey) || '0';
  }
  
  // Handle actionPlan specifically
  const actionPlan = container.querySelector('#actionPlan');
  if (actionPlan) {
    actionPlan.value = formData['actionPlan'] || localStorage.getItem('actionPlan') || '';
  }

  container.querySelectorAll('input, textarea').forEach(input => {
      if (formData[input.name]) {
          input.value = formData[input.name];
      }

      // Ensure the label's "for" attribute matches the input's "id"
      if (input.id) {
          const label = container.querySelector(`label[for="${input.id}"]`);
          if (label) {
              label.setAttribute('for', input.id);
          }
      }
  });

  container.querySelectorAll('.number-options').forEach(optionGroup => {
      const categoryId = optionGroup.id.replace('numberOptions', 'category');
      const savedValue = formData[categoryId];
      if (savedValue) {
          const matchingOption = Array.from(optionGroup.children).find(option => option.textContent === savedValue);
          if (matchingOption) {
              matchingOption.classList.add('selected');
          }
      }
  });
  
  // Update chart after restoring inputs
  updateChart();
}

function saveInputs() {
    document.querySelectorAll('#form-container input, #form-container textarea').forEach(input => {
        formData[input.name] = input.value;
    });

    document.querySelectorAll('#form-container .number-options').forEach(optionGroup => {
        const selected = optionGroup.querySelector('.selected');
        if (selected) {
            const categoryId = optionGroup.id.replace('numberOptions', 'category');
            formData[categoryId] = selected.textContent;
        }
    });

    localStorage.setItem('formData', JSON.stringify(formData)); // Save formData to localStorage
    
    // Always update the chart whenever inputs are saved
    updateChart();
}

// Update resetForm to use the helper
function resetForm() {
    if (confirm('Are you sure you want to reset the form? All data will be lost.')) {
        // Clear the combined formData object
        localStorage.removeItem('formData');
        
        // Clear individual category items (A-O)
        for (let i = 65; i <= 79; i++) {
            const categoryKey = 'category' + String.fromCharCode(i);
            localStorage.removeItem(categoryKey);
        }
        
        // Clear progress data
        localStorage.removeItem('progress');
        
        // Clear project info fields
        const fieldIds = ['datum', 'projekt', 'affarsomrade', 'plats', 'skede', 
                          'bestallare', 'team', 'forfattare'];
        fieldIds.forEach(fieldId => {
            localStorage.removeItem(fieldId);
        });
        
        // Clear action plan
        localStorage.removeItem('actionPlan');
        
        // Reset the in-memory formData object
        formData = {};
        
        // Clear any existing chart and reset to 0%
        updateProgressChart(document, true);
        
        // Clear actionPlan textarea if it exists in the current page
        const actionPlanElement = document.getElementById('actionPlan');
        if (actionPlanElement) {
            actionPlanElement.value = '';
        }
        
        console.log('Form data reset completely.');
        loadPage(0); // Reload the first page
    }
}

// Attach resetForm to the global window object
window.resetForm = resetForm;

// Delegate click events for toggle buttons
document.getElementById('form-container').addEventListener('click', function (event) {
    if (event.target.closest('.toggle-button')) {
        toggleText(event.target.closest('.toggle-button'));
    }
});

// Make toggleText globally accessible
function toggleText(button) {
    const column = button.closest('.column');
    column.classList.toggle('expanded');
}

// Function to reattach toggleText event listeners
function reattachToggleListeners() {
    document.querySelectorAll('.toggle-button').forEach(button => {
        button.addEventListener('click', function () {
            toggleText(this);
        });
    });
}

// Attach toggleText and reattachToggleListeners to the global window object
window.toggleText = toggleText;
window.reattachToggleListeners = reattachToggleListeners;

// Helper function to wait for a chart to finish rendering
function waitForChartRender(chartElement, timeout = 5000) {
    return new Promise((resolve, reject) => {
        if (!chartElement) {
            resolve(); // No chart to wait for
            return;
        }
        
        const chart = echarts.getInstanceByDom(chartElement);
        if (!chart) {
            resolve(); // No chart instance, nothing to wait for
            return;
        }
        
        // Check if the chart is already rendered (has canvas with content)
        const canvas = chartElement.querySelector('canvas');
        if (canvas && canvas.width > 0 && canvas.height > 0 && 
            // Additionally check if there's content drawn on the canvas
            canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data.some(channel => channel !== 0)) {
            // Chart already has rendered content
            console.log('Chart already rendered, proceeding immediately');
            resolve();
            return;
        }
        
        console.log('Waiting for chart to render...');
        
        // Set a timeout for the maximum wait time
        const timeoutId = setTimeout(() => {
            document.removeEventListener('chartRendered', onChartRendered);
            console.warn('Chart render timeout - proceeding anyway');
            resolve(); // Resolve anyway to prevent blocking
        }, timeout);
        
        // Listen for the custom chartRendered event
        const onChartRendered = () => {
            clearTimeout(timeoutId);
            document.removeEventListener('chartRendered', onChartRendered);
            console.log('Chart rendered event received');
            // Give a small extra time for any final rendering
            setTimeout(resolve, 100);
        };
        
        document.addEventListener('chartRendered', onChartRendered);
        
        // Force a chart update to ensure the finished event will fire
        chart.resize();
    });
}

// Make exportPDF globally accessible
async function exportPDF() {
    if (!window.jspdf) {
        alert('PDF library not loaded. Please try again later.');
        return;
    }

    // Backup the current form and progress data before PDF export
    const formDataBackup = JSON.parse(localStorage.getItem('formData')) || {};
    const progressBackup = JSON.parse(localStorage.getItem('progress')) || {};
    const categoryBackup = {};
    for (let i = 65; i <= 79; i++) {
        const categoryKey = 'category' + String.fromCharCode(i);
        categoryBackup[categoryKey] = localStorage.getItem(categoryKey);
    }
    // Backup action plan separately
    const actionPlanBackup = localStorage.getItem('actionPlan');

    // Create a style element to disable all animations and hide content during export
    const noAnimationsStyle = document.createElement('style');
    noAnimationsStyle.textContent = `
        * {
            transition: none !important;
            animation: none !important;
            animation-duration: 0s !important;
            transition-duration: 0s !important;
        }
        /* Hide all content during export */
        body > *:not(#loadingDiv):not(#pdf-render-container) {
            visibility: hidden !important;
        }
                /* Hide ART logo during PDF export */
    .art-logo {
        display: none !important;
    }
    `;
    document.head.appendChild(noAnimationsStyle);

    // Initialize jsPDF
    let jsPDF;
    if (window.jspdf.jsPDF) {
        jsPDF = window.jspdf.jsPDF;
    } else {
        ({ jsPDF } = window.jspdf);
    }

    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
        compress: true,
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const currentPageBackup = currentPage;

    // Show loading indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.innerHTML = 'Preparing PDF export...';
    loadingDiv.style.position = 'fixed';
    loadingDiv.style.top = '50%';
    loadingDiv.style.left = '50%';
    loadingDiv.style.transform = 'translate(-50%, -50%)';
    loadingDiv.style.background = 'rgba(255,255,255,0.9)';
    loadingDiv.style.padding = '20px';
    loadingDiv.style.borderRadius = '5px';
    loadingDiv.style.zIndex = '9999';
    document.body.appendChild(loadingDiv);

    // Create a fixed-size rendering container
    const renderContainer = document.createElement('div');
    renderContainer.id = 'pdf-render-container';
    renderContainer.style.position = 'absolute';
    renderContainer.style.top = '-9999px';
    renderContainer.style.left = '-9999px';
    const multiplier = 1; // Define a multiplier variable
    renderContainer.style.width = `${2000 * multiplier}px`;
    renderContainer.style.height = `${1000 * multiplier}px`;
    renderContainer.style.overflow = 'hidden';
    renderContainer.style.backgroundColor = '#ebebeb';//canvas background color
    document.body.appendChild(renderContainer);

    try {
        // Use a modified array of pages for the PDF export
        const pdfPages = ['project_info_print.html', 'vision.html', 'step1.html', 'step2.html', 'step3.html', './summary.html'];
        
        for (let i = 0; i < pdfPages.length; i++) {
            loadingDiv.innerHTML = `Rendering page ${i + 1} of ${pdfPages.length}...`;

            // For the first page (project info), load the print-specific version
            if (i === 0) {
                try {
                    const res = await fetch(pdfPages[i]);
                    if (!res.ok) throw new Error(`Failed to load ${pdfPages[i]}`);
                    const html = await res.text();
                    
                    // Create a temporary element to hold the project info print content
                    renderContainer.innerHTML = html;
                    
                    // Fill in values from localStorage for project info fields
                    const fieldIds = ['datum', 'projekt', 'affarsomrade', 'plats', 'skede', 
                                     'bestallare', 'team', 'forfattare'];
                                     
                    fieldIds.forEach(fieldId => {
                        const value = localStorage.getItem(fieldId) || formData[fieldId] || '';
                        const input = renderContainer.querySelector(`#${fieldId}`);
                        if (input) input.value = value;
                        
                        // For date field, also update the display element
                        if (fieldId === 'datum') {
                            const dateDisplay = renderContainer.querySelector('#datum-display');
                            if (dateDisplay) dateDisplay.textContent = value;
                        }
                    });
                    
                    await new Promise(resolve => setTimeout(resolve, 500));
                } catch (error) {
                    console.error(`Error loading ${pdfPages[i]}:`, error);
                    // If loading fails, create a simple page with error message
                    renderContainer.innerHTML = '<div class="header"><h1>Project Information</h1></div><p>Error loading project information page.</p>';
                }
            } else if (i === 1) { // Vision page
                // Handle special case for vision page
                try {
                    const res = await fetch(pdfPages[i]);
                    if (!res.ok) throw new Error(`Failed to load ${pdfPages[i]}`);
                    const html = await res.text();
                    
                    // Create a temporary element to hold the vision page content
                    renderContainer.innerHTML = html;

                    // Just give extra time for rendering
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                } catch (error) {
                    console.error(`Error preparing vision page for PDF:`, error);
                }
            } else {
                // For other pages, use the normal page loading mechanism
                const oldTransitioning = isTransitioning;
                isTransitioning = false;
                await loadPage(i);
                isTransitioning = oldTransitioning;

                if (i < pdfPages.length - 1) {
                    document.querySelectorAll('.toggle-button').forEach(button => {
                        button.style.display = 'none';
                    });

                    document.querySelectorAll('.column').forEach(column => {
                        column.classList.add('expanded');
                    });
                }

                if (i === pdfPages.length - 1) {
                    const roseChart = document.getElementById('roseChart');
                    if (roseChart) {
                        updateSummaryChart();
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    }
                } else {
                    const doughnutChart = document.getElementById('doughnutChart');
                    if (doughnutChart) {
                        updateChart();
                        await new Promise(resolve => setTimeout(resolve, 500));
                    }
                }

                renderContainer.innerHTML = '';

                let contentToClone;
                if (i === pdfPages.length - 1) {
                    contentToClone = document.querySelector('.header');
                    if (contentToClone) {
                        renderContainer.appendChild(contentToClone.cloneNode(true));
                    }

                    const topCategories = document.querySelector('.top-categories');
                    if (topCategories) {
                        renderContainer.appendChild(topCategories.cloneNode(true));
                    }

                    const chartWrapper = document.createElement('div');
                    chartWrapper.style.position = 'absolute';
                    chartWrapper.style.width = '2000px';
                    chartWrapper.style.height = '1050px'; //x
                    chartWrapper.style.margin = '20px auto';
                    chartWrapper.style.top = '0';
                    renderContainer.appendChild(chartWrapper);

                    const chartContainer = document.createElement('div');
                    chartContainer.style.position = 'absolute';
                    chartContainer.style.top = '0';
                    chartContainer.style.left = '0';
                    chartContainer.style.width = '100%';
                    chartContainer.style.height = '100%';

                    const originalChart = document.getElementById('roseChart');
                    if (originalChart) {
                        const canvas = originalChart.querySelector('canvas');
                        if (canvas) {
                            const canvasClone = document.createElement('canvas');
                            canvasClone.width = canvas.width;
                            canvasClone.height = canvas.height;
                            canvasClone.style.width = '100%';
                            canvasClone.style.height = '100%';
                            canvasClone.getContext('2d').drawImage(canvas, 0, 0);
                            chartContainer.appendChild(canvasClone);
                        }
                    }

                    chartWrapper.appendChild(chartContainer);

                    const labelsContainer = document.getElementById('labels-container');
                    if (labelsContainer) {
                        const labelsClone = document.createElement('div');
                        labelsClone.id = 'pdf-labels-container';
                        labelsClone.style.position = 'absolute';
                        labelsClone.style.top = '0';
                        labelsClone.style.left = '0';
                        labelsClone.style.width = '100%';
                        labelsClone.style.height = '100%';
                        labelsClone.style.zIndex = '10';
                        chartWrapper.appendChild(labelsClone);

                        positionLabelsForPDF(labelsClone, chartWrapper.clientWidth, chartWrapper.clientHeight);
                    }
                } else if (i > 0) { // Skip this for the first page as we handle it separately
                    const header = document.querySelector('.header');
                    if (header) {
                        renderContainer.appendChild(header.cloneNode(true));
                    }

                    const container = document.querySelector('.container');
                    if (container) {
                        const containerClone = container.cloneNode(true);
                        containerClone.querySelectorAll('button, [onclick], .toggle-button').forEach(el => {
                            if (el.classList.contains('toggle-button')) {
                                el.style.cursor = 'default';
                                el.removeAttribute('onclick');
                            } else if (el.closest('.number-options')) {
                                el.removeAttribute('onclick');
                                el.style.cursor = 'default';
                            } else {
                                el.parentNode.removeChild(el);
                            }
                        });
                        renderContainer.appendChild(containerClone);
                    }

                    // Only add doughnut chart for steps 1-3 (pages 2-4)
                    if (i >= 2 && i <= 4) {
                        const doughnutChart = document.getElementById('doughnutChart');
                        if (doughnutChart) {
                            updateChart();
                            await new Promise(resolve => setTimeout(resolve, 500));
                        }
                    }
                }
            }

            const canvas = await html2canvas(renderContainer, {
                scale: 2.0, // Adjust scale for better quality
                useCORS: true,
                logging: false,
                allowTaint: true,
                imageTimeout: 0
            });

            if (i > 0) {
                doc.addPage();
            }
            
            // Add background to each page
            doc.setFillColor(235, 235, 235); // RGB values for #ebebeb
            doc.rect(0, 0, pageWidth, pageHeight, 'F'); // 'F' means fill

            try {
                const imgData = canvas.toDataURL('image/jpeg', 2);
                const padding = 10;
                const availableWidth = pageWidth - (2 * padding);
                const availableHeight = pageHeight - (2 * padding);

                const imgProps = doc.getImageProperties(imgData);

                const calculateDimensions = (imgProps, availableWidth, availableHeight) => {
                    const imgRatio = imgProps.width / imgProps.height;
                    const pageRatio = availableWidth / availableHeight;

                    let finalWidth, finalHeight;

                    if (imgRatio > pageRatio) {
                        finalWidth = availableWidth;
                        finalHeight = finalWidth / imgRatio;
                    } else {
                        finalHeight = availableHeight;
                        finalWidth = finalHeight * imgRatio;
                    }

                    const xOffset = padding + (availableWidth - finalWidth) / 2;
                    const yOffset = padding + (availableHeight - finalHeight) / 2;

                    return { width: finalWidth, height: finalHeight, x: xOffset, y: yOffset };
                };

                const dims = calculateDimensions(imgProps, availableWidth, availableHeight);

                doc.addImage(
                    imgData,
                    'JPEG',
                    dims.x,
                    dims.y,
                    dims.width,
                    dims.height,
                    undefined,
                    'FAST'
                );
            } catch (imgError) {
                console.error('Error adding image to PDF:', imgError);
                doc.setFontSize(12);
                doc.text(`Error capturing page ${i + 1}. Please try again.`, 10, 10);
            }
        }

        loadingDiv.innerHTML = 'Generating final PDF...';
        doc.save('ART-Resultat.pdf');

        loadingDiv.innerHTML = 'PDF successfully created!';
        setTimeout(() => {
            if (document.body.contains(loadingDiv)) {
                document.body.removeChild(loadingDiv);
            }
        }, 2000);
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF: ' + error.message);
    } finally {
        // Restore the original form and progress data after PDF export
        localStorage.setItem('formData', JSON.stringify(formDataBackup));
        localStorage.setItem('progress', JSON.stringify(progressBackup));
        for (let i = 65; i <= 79; i++) {
            const categoryKey = 'category' + String.fromCharCode(i);
            if (categoryBackup[categoryKey] !== null) {
                localStorage.setItem(categoryKey, categoryBackup[categoryKey]);
            }
        }
        // Restore action plan
        if (actionPlanBackup !== null) {
            localStorage.setItem('actionPlan', actionPlanBackup);
        }
        formData = {...formDataBackup};  // Restore the in-memory formData

        if (document.body.contains(renderContainer)) {
            document.body.removeChild(renderContainer);
        }

        if (document.head.contains(noAnimationsStyle)) {
            document.head.removeChild(noAnimationsStyle);
        }

        setTimeout(() => {
            if (document.body.contains(loadingDiv)) {
                document.body.removeChild(loadingDiv);
            }
        }, 1000);

        if (currentPage !== currentPageBackup) {
            loadPage(currentPageBackup);
            // Force a refresh of the chart with the correct data
            setTimeout(() => {
                updateChart();
            }, 500);
        }
    }
}

function positionLabelsForPDF(container, width, height) {
    container.innerHTML = ""; // Clear any existing content
    
    // Create a temporary container with the same dimensions
    const tempContainer = document.createElement('div');
    tempContainer.id = 'labels-container'; // Use the same ID as the original
    tempContainer.style.width = width + 'px';
    tempContainer.style.height = height + 'px';
    tempContainer.style.position = 'absolute';
    tempContainer.style.visibility = 'hidden';
    document.body.appendChild(tempContainer);
    
    try {
        // Call the original positionLabels function
        // We need to grab it from the updateSummaryChart closure
        const originalPositionLabels = function() {
            const radius = tempContainer.clientWidth / (5.4-0.8); // Use original calculation
            const centerX = tempContainer.clientWidth / 2;
            const centerY = tempContainer.clientHeight / 2;
            
            const categories = [
                { name: 'NYTTJANDE', value: parseFloat(formData['categoryA'] || localStorage.getItem('categoryA') || 0) },
                { name: 'VÄLMÅENDE', value: parseFloat(formData['categoryB'] || localStorage.getItem('categoryB') || 0) },
                { name: 'INKLUDERING', value: parseFloat(formData['categoryC'] || localStorage.getItem('categoryC') || 0) },
                { name: 'BETEENDEFÖRÄNDRING', value: parseFloat(formData['categoryD'] || localStorage.getItem('categoryD') || 0) },
                { name: 'BIODIVERSITET', value: parseFloat(formData['categoryE'] || localStorage.getItem('categoryE') || 0) },
                { name: 'KLIMATAVTRYCK', value: parseFloat(formData['categoryF'] || localStorage.getItem('categoryF') || 0) },
                { name: 'MARK', value: parseFloat(formData['categoryG'] || localStorage.getItem('categoryG') || 0) },
                { name: 'ENERGI', value: parseFloat(formData['categoryH'] || localStorage.getItem('categoryH') || 0) },
                { name: 'PENGAR', value: parseFloat(formData['categoryI'] || localStorage.getItem('categoryI') || 0) },
                { name: 'RESURSUTNYTTJANDE', value: parseFloat(formData['categoryJ'] || localStorage.getItem('categoryJ') || 0) },
                { name: 'RESILIENS', value: parseFloat(formData['categoryK'] || localStorage.getItem('categoryK') || 0) },
                { name: 'SKÖNHET', value: parseFloat(formData['categoryL'] || localStorage.getItem('categoryL') || 0) },
                { name: 'FLEXIBILITET', value: parseFloat(formData['categoryM'] || localStorage.getItem('categoryM') || 0) },
                { name: 'ÄGANDESKAP', value: parseFloat(formData['categoryN'] || localStorage.getItem('categoryN') || 0) },
                { name: 'DEMONTERBARHET', value: parseFloat(formData['categoryO'] || localStorage.getItem('categoryO') || 0) }
            ];
            
            categories.forEach((category, index) => {
                const angle = index * 24; // Varje kategori tar upp 24° (360° / 15)
                const adjustedAngle = angle +12; // Justerar för att kompensera för den roterade cirkeln
                
                const radians = (adjustedAngle - 90) * (Math.PI / 180); // -90 för att börja från toppen
                
                const x = centerX + radius * Math.cos(radians); 
                const y = centerY + radius * Math.sin(radians);
                
                const label = document.createElement('div');
                label.classList.add('category-label');
                label.textContent = category.name;
                
                // Placera texten på rätt koordinater
                label.style.left = `${x}px`;
                label.style.top = `${y}px`;
                
                // Roterar texten för att följa cirkeln
                let textRotation = adjustedAngle; 
                
                // Om texten är upp och ner, vänd den tillbaka
                if (textRotation > 90 && textRotation < 270) {
                    textRotation += 180;
                }

                
                label.style.transform = `translate(-50%, -50%) rotate(${textRotation}deg)`;
                
                tempContainer.appendChild(label);
            });
        };
        
        // Run the original function to populate the temp container
        originalPositionLabels();
        
        // Now copy all the labels to our PDF container, with PDF-specific styles
        const labels = tempContainer.querySelectorAll('.category-label');
        labels.forEach(originalLabel => {
            const clonedLabel = originalLabel.cloneNode(true);
            // Add PDF-specific styles
            clonedLabel.style.position = 'absolute';
            clonedLabel.style.fontWeight = 'bold';
            clonedLabel.style.fontSize = '12px';
            clonedLabel.style.display = 'block';
            clonedLabel.style.visibility = 'visible';
            
            // Copy all the original positioning
            clonedLabel.style.left = originalLabel.style.left;
            clonedLabel.style.top = originalLabel.style.top;
            clonedLabel.style.transform = originalLabel.style.transform;
            
            container.appendChild(clonedLabel);
        });
    } finally {
        // Clean up the temporary container
        if (document.body.contains(tempContainer)) {
            document.body.removeChild(tempContainer);
        }
    }
}

// Clear formData on page load
window.onload = () => {
    clearAllData();
    loadPage(0); // Load the first page

};

// Attach functions to the global window object to ensure they are accessible from the HTML
window.nextPage = nextPage;
window.prevPage = prevPage;
window.resetForm = resetForm;
window.exportPDF = exportPDF;

// Warn the user before leaving the page
window.addEventListener('beforeunload', (event) => {
    clearAllData();
    event.preventDefault();
    event.returnValue = 'Are you sure you want to leave? Your data will be lost.';
});

function clearAllData() {
    // Clear the combined formData object
    localStorage.removeItem('formData');
    
    // Clear individual category items (A-O)
    for (let i = 65; i <= 79; i++) {
        const categoryKey = 'category' + String.fromCharCode(i);
        localStorage.removeItem(categoryKey);
    }
    
    // Clear progress data
    localStorage.removeItem('progress');
    
    // Clear project info fields
    const fieldIds = ['datum', 'projekt', 'affarsomrade', 'plats', 'skede', 
                      'bestallare', 'team', 'forfattare'];
    fieldIds.forEach(fieldId => {
        localStorage.removeItem(fieldId);
    });
    
    // Clear action plan
    localStorage.removeItem('actionPlan');
    
    // Reset the in-memory formData object
    formData = {};
    
    console.log('All form data cleared completely.');
}
