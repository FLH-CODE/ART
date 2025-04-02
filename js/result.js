document.addEventListener('DOMContentLoaded', function () {
    console.log("JavaScript file is running!"); // Första felsökningsmeddelandet

    // Hämta värden från localStorage
    const categories = [
        { name: 'NYTTJANDE', value: parseFloat(localStorage.getItem('categoryA') || 0) },
        { name: 'VÄLMÅENDE', value: parseFloat(localStorage.getItem('categoryB') || 0) },
        { name: 'INKLUDERING', value: parseFloat(localStorage.getItem('categoryC') || 0) },
        { name: 'BETEENDEFÖRÄNDRING', value: parseFloat(localStorage.getItem('categoryD') || 0) },
        { name: 'BIODIVERSITET', value: parseFloat(localStorage.getItem('categoryE') || 0) },
        { name: 'KLIMATAVTRYCK', value: parseFloat(localStorage.getItem('categoryF') || 0) },
        { name: 'MARK', value: parseFloat(localStorage.getItem('categoryG') || 0) },
        { name: 'ENERGI', value: parseFloat(localStorage.getItem('categoryH') || 0) },
        { name: 'PENGAR', value: parseFloat(localStorage.getItem('categoryI') || 0) },
        { name: 'RESURSUTNYTTJANDE', value: parseFloat(localStorage.getItem('categoryJ') || 0) },
        { name: 'RESILIENS', value: parseFloat(localStorage.getItem('categoryK') || 0) },
        { name: 'SKÖNHET', value: parseFloat(localStorage.getItem('categoryL') || 0) },
        { name: 'FLEXIBILITET', value: parseFloat(localStorage.getItem('categoryM') || 0) },
        { name: 'ÄGANDESKAP', value: parseFloat(localStorage.getItem('categoryN') || 0) },
        { name: 'DEMONTERBARHET', value: parseFloat(localStorage.getItem('categoryO') || 0) }
    ];

    console.log("Original categories:", categories);
    
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
    const additionalCategories = sortedCategories.slice(3, 6);
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

    // Initialisera diagrammet
    var chartDom = document.getElementById('roseChart');
    var myChart = echarts.init(chartDom);

    // Rensa tidigare instanser
    myChart.clear();

    // Alternativ för diagrammet
    var option = {
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
                    cursor: 'default' // Pekaren förblir pil (inte hand)
                },
                label: {
                    show: false // Dölj etiketter
                },
                emphasis: {
                    disabled: true, // Inaktivera hover-effekter
                    itemStyle: {
                        cursor: 'default' // Pekaren förblir pil även vid hover
                    }
                },
                tooltip: {
                    show: false // Dölj tooltip vid hover
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
                    cursor: 'pointer' // Pekaren blir en hand vid hover på Data-serien
                },
                label: { 
                    show: false 
                }, // Dölj etiketter
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

    // Rendera diagrammet och tvinga uppdatering
    myChart.setOption(option, true);

    // Notify when the chart is fully rendered
    myChart.on('finished', function () {
        console.log('Chart rendering finished.'); // Debugging log
        document.dispatchEvent(new Event('chartRendered')); // Dispatch custom event
    });

    // 🎯 Lägg till statiska etiketter runt diagrammet
    function positionLabels() {
        const labelsContainer = document.getElementById('labels-container');
        labelsContainer.innerHTML = ""; // Rensa befintliga etiketter för att undvika duplicering
    
        const radius = labelsContainer.clientWidth / 5.4; // Dynamiskt baserat på fönsterstorlek
        const centerX = labelsContainer.clientWidth / 2;
        const centerY = labelsContainer.clientHeight / 2;
    
        categories.forEach((category, index) => {
            const angle = index * 24; // Varje kategori tar upp 24° (360° / 15)
            const adjustedAngle = angle + 180; // Justerar för att kompensera för den roterade cirkeln
    
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
            // 🔥 Extra rotation för de kategorier som visas åt fel håll
        if (['BETEENDEFÖRÄNDRING', 'INKLUDERING', 'VÄLMÅENDE', 'NYTTJANDE'].includes(category.name)) {
            textRotation += 180;
        }
    
            label.style.transform = `translate(-50%, -50%) rotate(${textRotation}deg)`;
    
            labelsContainer.appendChild(label);
        });
    }
    
    // Positionera etiketter vid start
    positionLabels();
    
    // Anropa funktionen igen när fönstret ändras för att behålla rätt positioner
    window.addEventListener('resize', () => {
        positionLabels();
        myChart.resize(); // Ensure the chart resizes dynamically
    });
});