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
      
      // Display export button on summary page and attach event handler
      const exportBtn = document.getElementById('exportBtn');
      if (exportBtn) {
          exportBtn.style.display = (index === pages.length - 1) ? 'inline-block' : 'none';
          exportBtn.onclick = exportPDF;
      }

    }, 500);

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
    
    const visualizationContainer = document.getElementById('visualizationContainer');
    if (!visualizationContainer) {
        console.error('Visualization container not found.');
        return;
    }
    
    // Clear the container first
    visualizationContainer.innerHTML = '';
    
    // Create chart div
    const chartDiv = document.createElement('div');
    chartDiv.id = 'roseChart';
    chartDiv.style.width = '100%';
    chartDiv.style.height = '100%';
    chartDiv.style.position = 'relative';
    
    // Create labels container div that will be positioned over the chart
    const labelsDiv = document.createElement('div');
    labelsDiv.id = 'labels-container';
    labelsDiv.style.position = 'absolute';
    labelsDiv.style.top = '0';
    labelsDiv.style.left = '0';
    labelsDiv.style.width = '100%';
    labelsDiv.style.height = '100%';
    labelsDiv.style.pointerEvents = 'none';
    
    // Add both to the visualization container
    visualizationContainer.appendChild(chartDiv);
    visualizationContainer.appendChild(labelsDiv);
    
    // Initialize the chart
    let myChart = echarts.init(chartDiv);
    
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

    // Hitta topp 3 kategorier baserat på högsta värde
    const topCategories = [...categories].sort((a, b) => b.value - a.value).slice(0, 3);
    const topCategoriesList = document.getElementById('topCategoriesList');
    if (topCategoriesList) {
        topCategoriesList.innerHTML = ''; // Clear existing items
        topCategories.forEach(category => {
            const listItem = document.createElement('li');
            listItem.textContent = `${category.name}: ${category.value}`;
            topCategoriesList.appendChild(listItem);
        });
    }
    
    // Hitta kategorierna rankade 4-6
    const additionalCategories = [...categories].sort((a, b) => b.value - a.value).slice(3, 6);
    const additionalCategoriesList = document.getElementById('additionalCategoriesList');
    if (additionalCategoriesList) {
        additionalCategoriesList.innerHTML = ''; // Clear existing items
        additionalCategories.forEach(category => {
            const listItem = document.createElement('li');
            listItem.textContent = `${category.name}: ${category.value}`;
            additionalCategoriesList.appendChild(listItem);
        });
    }

    // Skapa en serie för maxvärdet med olika färger
    const maxSeries = categories.map(category => ({
        name: category.name,
        value: 5,
        itemStyle: {
            color: '#e5e4e4', // Ljusgrå färg
            borderColor: '#fff', 
            borderWidth: 1
        }
    }));

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
                fontFamily: 'CircularStd-Bold',
                fontSize: 14,
                fontWeight: 'normal',
                color: '#000'
            },
            backgroundColor: 'transparent',
            borderColor: 'transparent',
            shadowBlur: 0,
            shadowColor: 'transparent',
            shadowOffsetX: 0,
            shadowOffsetY: 0
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
                        cursor: 'pointer'
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

    // Position labels after chart is rendered
    myChart.on('rendered', function() {
        positionLabelsOverChart(categories);
    });

    // Ensure the chart resizes dynamically on window resize
    window.addEventListener('resize', () => {
        if (myChart && !myChart.isDisposed()) {
            myChart.resize();
            // Reposition labels after resize
            positionLabelsOverChart(categories);
        }
    });
    
    // Store chart instance in a global variable for access in export function
    window.roseChartInstance = myChart;
}

// New function to position labels directly over the chart
function positionLabelsOverChart(categories) {
    const labelsContainer = document.getElementById('labels-container');
    if (!labelsContainer) return;
    
    // Clear existing labels
    labelsContainer.innerHTML = "";
    
    // Get chart dimensions
    const chartDiv = document.getElementById('roseChart');
    if (!chartDiv) return;
    
    const containerRect = chartDiv.getBoundingClientRect();
    const centerX = containerRect.width / 2;
    const centerY = containerRect.height / 2;
    
    // Calculate radius based on chart size
    const radius = Math.min(centerX, centerY) * 0.85; // 85% of minimum dimension
    
    categories.forEach((category, index) => {
        const angle = index * 24; // 360° / 15 categories = 24° per category
        const adjustedAngle = angle + 12; // Center in segment
        
        const radians = (adjustedAngle - 90) * (Math.PI / 180); // -90 to start from top
        
        // Calculate position
        const x = centerX + radius * Math.cos(radians);
        const y = centerY + radius * Math.sin(radians);
        
        // Create label element
        const label = document.createElement('div');
        label.classList.add('category-label');
        label.textContent = category.name;
        
        // Position the label
        label.style.position = 'absolute';
        label.style.left = `${x}px`;
        label.style.top = `${y}px`;
        
        // Style for readability
        label.style.fontSize = '0.7em';
        label.style.color = '#4a4a4a';
        label.style.fontFamily = 'CircularStd-Book, sans-serif';
        label.style.whiteSpace = 'nowrap';
        label.style.textAlign = 'center';
        label.style.transformOrigin = 'center';
        
        // Rotate label to align with segment
        let rotation = adjustedAngle;
        
        // Flip text for better readability if on bottom half
        if (rotation > 90 && rotation < 270) {
            rotation += 180;
        }
        
        label.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
        
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

// Improved exportPDF function that uses the existing chart rendering
async function exportPDF() {
    if (!window.jspdf) {
        alert('PDF library not loaded. Please try again later.');
        return;
    }

    // Backup the current page to return to later
    const currentPageBackup = currentPage;
    
    // Show loading indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loadingDiv';
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

    try {
        // Define the pages we want to capture
        const pdfPages = [
            { path: 'project_info_print.html', index: 0 },
            { path: 'vision.html', index: 1 },
            { path: 'step1.html', index: 2 },
            { path: 'step2.html', index: 3 },
            { path: 'step3.html', index: 4 },
            { path: './summary.html', index: 5 }
        ];

        // First navigate through all pages to ensure charts are properly rendered
        loadingDiv.innerHTML = 'Rendering charts on all pages...';
        
        // First, visit all pages to make sure charts are rendered
        for (let i = 0; i < pdfPages.length; i++) {
            loadingDiv.innerHTML = `Pre-rendering page ${i + 1} of ${pdfPages.length}...`;
            await loadPage(pdfPages[i].index);
            // Wait for chart rendering to complete
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Create a style element to disable animations during capture
        const noAnimationsStyle = document.createElement('style');
        noAnimationsStyle.textContent = `
            * {
                transition: none !important;
                animation: none !important;
                animation-duration: 0s !important;
                transition-duration: 0s !important;
            }
        `;
        document.head.appendChild(noAnimationsStyle);

        // Create a container for rendering pages for PDF
        const renderContainer = document.createElement('div');
        renderContainer.id = 'pdf-render-container';
        renderContainer.style.position = 'fixed';
        renderContainer.style.top = '0';
        renderContainer.style.left = '0';
        renderContainer.style.width = '100%';
        renderContainer.style.height = '100%';
        renderContainer.style.background = '#ebebeb';
        renderContainer.style.zIndex = '-1';
        renderContainer.style.visibility = 'hidden';
        document.body.appendChild(renderContainer);

        // Now capture each page without recreating charts
        for (let i = 0; i < pdfPages.length; i++) {
            loadingDiv.innerHTML = `Capturing page ${i + 1} of ${pdfPages.length}...`;
            
            // Navigate to the current page
            await loadPage(pdfPages[i].index);
            
            // Wait for any transitions to complete
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // For the project info page, we need to load a different HTML
            if (i === 0) {
                try {
                    // Load the print version for project info
                    const res = await fetch('project_info_print.html');
                    if (!res.ok) throw new Error('Failed to load project_info_print.html');
                    const html = await res.text();
                    renderContainer.innerHTML = html;
                    
                    // Fill in form fields
                    const fieldIds = ['datum', 'projekt', 'affarsomrade', 'plats', 'skede', 
                                     'bestallare', 'team', 'forfattare'];
                    fieldIds.forEach(fieldId => {
                        const value = localStorage.getItem(fieldId) || '';
                        const input = renderContainer.querySelector(`#${fieldId}`);
                        if (input) input.value = value;
                        
                        if (fieldId === 'datum') {
                            const dateDisplay = renderContainer.querySelector('#datum-display');
                            if (dateDisplay) dateDisplay.textContent = value;
                        }
                    });
                    
                    // Capture the render container
                    renderContainer.style.visibility = 'visible';
                    const canvas = await html2canvas(renderContainer, {
                        scale: 2.0,
                        useCORS: true,
                        logging: false,
                        allowTaint: true
                    });
                    renderContainer.style.visibility = 'hidden';
                    
                    // Add the image to the PDF
                    const imgData = canvas.toDataURL('image/jpeg', 0.9);
                    addImageToPDF(doc, imgData, i === 0, pageWidth, pageHeight);
                    
                } catch (error) {
                    console.error('Error rendering project info page:', error);
                    // Still add a page with error message
                    doc.setFillColor(235, 235, 235);
                    doc.rect(0, 0, pageWidth, pageHeight, 'F');
                    doc.setFontSize(16);
                    doc.text(`Error rendering project info page: ${error.message}`, 20, 20);
                }
            } else {
                // For all other pages, we'll capture the current view
                
                // Expand all columns for better PDF readability
                document.querySelectorAll('.column').forEach(col => col.classList.add('expanded'));
                
                // Hide elements not needed in PDF
                const hiddenElements = [];
                document.querySelectorAll('.toggle-button, button:not(.print-only)').forEach(btn => {
                    if (btn.style.display !== 'none') {
                        hiddenElements.push({
                            element: btn,
                            originalDisplay: btn.style.display
                        });
                        btn.style.display = 'none';
                    }
                });
                
                // Get the form container which has the current page
                const formContainer = document.getElementById('form-container');
                if (!formContainer) {
                    console.error('Form container not found');
                    continue;
                }
                
                // Make sure the current page is fully visible and stable for capture
                await new Promise(resolve => setTimeout(resolve, 300));
                
                try {
                    // Capture the current page
                    const canvas = await html2canvas(formContainer, {
                        scale: 2.0,
                        useCORS: true,
                        logging: false,
                        allowTaint: true,
                        backgroundColor: '#ebebeb'
                    });
                    
                    // Add the image to PDF
                    const imgData = canvas.toDataURL('image/jpeg', 0.9);
                    addImageToPDF(doc, imgData, i === 0, pageWidth, pageHeight);
                    
                } catch (error) {
                    console.error(`Error capturing page ${i + 1}:`, error);
                    // Add error page
                    if (i > 0) doc.addPage();
                    doc.setFillColor(235, 235, 235);
                    doc.rect(0, 0, pageWidth, pageHeight, 'F');
                    doc.setFontSize(16);
                    doc.text(`Error capturing page ${i + 1}: ${error.message}`, 20, 20);
                } finally {
                    // Restore hidden elements
                    hiddenElements.forEach(item => {
                        item.element.style.display = item.originalDisplay;
                    });
                }
            }
        }

        // Generate and save the PDF
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
        if (document.body.contains(loadingDiv)) {
            document.body.removeChild(loadingDiv);
        }
    } finally {
        // Clean up
        const renderContainer = document.getElementById('pdf-render-container');
        if (renderContainer && document.body.contains(renderContainer)) {
            document.body.removeChild(renderContainer);
        }
        
        const noAnimationsStyle = document.querySelector('style[id^="no-animations"]');
        if (noAnimationsStyle && document.head.contains(noAnimationsStyle)) {
            document.head.removeChild(noAnimationsStyle);
        }
        
        // Return to the original page
        loadPage(currentPageBackup);
    }
}

// Helper function to add image to PDF with proper scaling
function addImageToPDF(doc, imgData, isFirstPage, pageWidth, pageHeight) {
    if (!isFirstPage) {
        doc.addPage();
    }
    
    // Add background to each page
    doc.setFillColor(235, 235, 235); // RGB values for #ebebeb
    doc.rect(0, 0, pageWidth, pageHeight, 'F'); // 'F' means fill
    
    // Calculate dimensions to fit on PDF page with margins
    const padding = 10;
    const availableWidth = pageWidth - (2 * padding);
    const availableHeight = pageHeight - (2 * padding);
    
    const imgProps = doc.getImageProperties(imgData);
    const imgRatio = imgProps.width / imgProps.height;
    const pageRatio = availableWidth / availableHeight;
    
    let finalWidth, finalHeight, xOffset, yOffset;
    
    if (imgRatio > pageRatio) {
        // Image is wider than page ratio
        finalWidth = availableWidth;
        finalHeight = finalWidth / imgRatio;
        xOffset = padding;
        yOffset = padding + (availableHeight - finalHeight) / 2;
    } else {
        // Image is taller than page ratio
        finalHeight = availableHeight;
        finalWidth = finalHeight * imgRatio;
        xOffset = padding + (availableWidth - finalWidth) / 2;
        yOffset = padding;
    }
    
    // Add the image to the PDF
    doc.addImage(imgData, 'JPEG', xOffset, yOffset, finalWidth, finalHeight, undefined, 'FAST');
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
