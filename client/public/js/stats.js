document.addEventListener('DOMContentLoaded', function() {
    console.log("Starting statistics loading...");

    // Set current year by default
    currentYear = new Date().getFullYear();
    console.log("Current year set:", currentYear);

    // Update current year button text
    document.getElementById('current-year-label').textContent = currentYear;

    // Initialize calendar
    try {
        initializeSimpleCalendar();
    } catch (error) {
        console.error("Error initializing calendar:", error);
    }

    // Load statistics data
    loadStats();

    // Configure refresh button
    document.getElementById('refreshStatsBtn').addEventListener('click', loadStats);

    // Configure reset button
    document.getElementById('resetDataBtn').addEventListener('click', resetData);

    // Configure calendar navigation buttons
    document.getElementById('year-prev').addEventListener('click', () => changeCalendarYear(-1));
    document.getElementById('year-next').addEventListener('click', () => changeCalendarYear(1));

    console.log("Event listeners configured correctly");
});

// Reset sample data
function resetData() {
    console.log("Resetting data...");

    // Remove existing data
    localStorage.removeItem('contentData');

    // Force reload of current page to initialize new data
    window.location.reload();
}

// Global variables for calendar
let calendarHeatmap;
let currentYear = new Date().getFullYear();

// GitHub style calendar implementation
function initializeSimpleCalendar() {
    console.log("Creating GitHub style calendar for year:", currentYear);

    // Update current year label
    document.getElementById('current-year-label').textContent = currentYear;

    // Get calendar container
    const calendarContainer = document.getElementById('publication-calendar');
    calendarContainer.innerHTML = '';
    calendarContainer.className = 'd-flex flex-column align-items-center w-100';
    calendarContainer.style.backgroundColor = 'rgba(30, 37, 50, 1)';
    calendarContainer.style.borderRadius = '6px';
    calendarContainer.style.padding = '20px';

    try {
        // Create total counter
        const totalContributions = document.createElement('div');
        totalContributions.className = 'text-start w-100 mb-4 fs-4 fw-bold';
        totalContributions.style.color = 'white';
        totalContributions.textContent = '0 publications found';
        calendarContainer.appendChild(totalContributions);

        // Create main calendar container
        const gitHubCalendar = document.createElement('div');
        gitHubCalendar.className = 'github-calendar-container w-100';
        gitHubCalendar.style.overflowX = 'auto';
        gitHubCalendar.style.paddingBottom = '10px';
        calendarContainer.appendChild(gitHubCalendar);

        // Create calendar grid
        const calendarGrid = document.createElement('div');
        calendarGrid.className = 'calendar-grid d-flex flex-nowrap';
        calendarGrid.style.position = 'relative';

        // Add weekdays on the left
        const weekdaysColumn = document.createElement('div');
        weekdaysColumn.className = 'weekdays-column me-2 d-flex flex-column justify-content-between';
        weekdaysColumn.style.paddingTop = '25px'; // Space to align with days
        weekdaysColumn.style.height = '128px'; // Fixed height for all weekdays

        // Weekday abbreviations
        const weekdays = ['Mon', '', 'Wed', '', 'Fri', '', ''];
        weekdays.forEach(day => {
            const dayElement = document.createElement('div');
            dayElement.className = 'weekday-label text-secondary text-end pe-2';
            dayElement.style.fontSize = '12px';
            dayElement.style.height = '15px';
            dayElement.style.lineHeight = '15px';
            dayElement.textContent = day;
            weekdaysColumn.appendChild(dayElement);
        });

        calendarGrid.appendChild(weekdaysColumn);

        // Get current date to calculate one year range
        const yearStart = new Date(currentYear, 0, 1);
        const yearEnd = new Date(currentYear, 11, 31);

        // Create array to store all cells by date
        const cellsByDate = {};

        // Add months
        const monthsContainer = document.createElement('div');
        monthsContainer.className = 'd-flex flex-column';

        // Row for month labels
        const monthsRow = document.createElement('div');
        monthsRow.className = 'd-flex months-row position-relative';
        monthsRow.style.height = '20px';
        monthsRow.style.marginBottom = '5px';
        monthsContainer.appendChild(monthsRow);

        // Short month names
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        // Container for weeks and days (grid)
        const weeksContainer = document.createElement('div');
        weeksContainer.className = 'd-flex flex-nowrap';
        monthsContainer.appendChild(weeksContainer);

        // Create a matrix for the entire year, starting with the first day of the first week
        // Calculate the first Sunday on or before January 1
        let startDate = new Date(currentYear, 0, 1);
        while (startDate.getDay() !== 0) { // 0 = Sunday
            startDate.setDate(startDate.getDate() - 1);
        }

        // For calculating month positions
        const monthPositions = {};
        let currentWeek = -1;

        // Generate cells for each day of the year
        let currentDate = new Date(startDate);
        let currentColumn = null;

        // Iterate until end of year
        while (currentDate <= yearEnd) {
            // Check if we're at a new week (Sunday)
            if (currentDate.getDay() === 0) {
                currentWeek++;
                currentColumn = document.createElement('div');
                currentColumn.className = 'week-column d-flex flex-column';
                weeksContainer.appendChild(currentColumn);

                // If we're in the first days of the month, save position
                if (currentDate.getDate() <= 7) {
                    const month = currentDate.getMonth();
                    monthPositions[month] = currentWeek * 13; // 13px per week
                }
            }

            // Create cell for day
            const dayCell = document.createElement('div');
            dayCell.className = 'day-cell';
            dayCell.style.width = '11px';
            dayCell.style.height = '11px';
            dayCell.style.margin = '2px';
            dayCell.style.borderRadius = '2px';
            dayCell.style.backgroundColor = 'rgba(22, 27, 34, 0.3)';
            dayCell.style.cursor = 'pointer';

            // Only store and color days from current year
            if (currentDate.getFullYear() === currentYear) {
                dayCell.dataset.fecha = currentDate.toISOString().split('T')[0];

                // Add tooltip with date
                const date = new Date(currentDate);
                const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                dayCell.title = `${date.toLocaleDateString('en-US', options)}\nNo publications`;

                // Map cell by its date for easy access
                cellsByDate[dayCell.dataset.fecha] = dayCell;
            } else {
                // Days outside current year, make them more transparent
                dayCell.style.opacity = '0.3';
            }

            // Add cell to week column
            currentColumn.appendChild(dayCell);

            // Advance to next day
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Add month labels based on calculated positions
        monthNames.forEach((name, index) => {
            if (monthPositions[index] !== undefined) {
                const monthLabel = document.createElement('div');
                monthLabel.className = 'month-label text-secondary';
                monthLabel.style.fontSize = '12px';
                monthLabel.style.position = 'absolute';
                monthLabel.style.top = '0';
                monthLabel.style.left = `${monthPositions[index] + 15}px`; // Adjusted for better alignment
                monthLabel.textContent = name;
                monthsRow.appendChild(monthLabel);
            }
        });

        calendarGrid.appendChild(monthsContainer);
        gitHubCalendar.appendChild(calendarGrid);

        // Intensity legend
        const legend = document.createElement('div');
        legend.className = 'd-flex justify-content-end align-items-center mt-3';

        const less = document.createElement('small');
        less.className = 'text-secondary me-2';
        less.style.fontSize = '12px';
        less.textContent = 'Less';
        legend.appendChild(less);

        const intensities = document.createElement('div');
        intensities.className = 'd-flex';

        // Add intensity squares
        const levels = 5;
        for (let i = 0; i < levels; i++) {
            const intensity = document.createElement('div');
            intensity.className = 'intensity-square';
            intensity.style.width = '10px';
            intensity.style.height = '10px';
            intensity.style.margin = '0 2px';
            intensity.style.borderRadius = '2px';
            const opacity = 0.2 + ((i + 1) / levels) * 0.8;
            intensity.style.backgroundColor = `rgba(20, 110, 70, ${opacity})`;
            intensities.appendChild(intensity);
        }
        legend.appendChild(intensities);

        const more = document.createElement('small');
        more.className = 'text-secondary ms-2';
        more.style.fontSize = '12px';
        more.textContent = 'More';
        legend.appendChild(more);

        gitHubCalendar.appendChild(legend);

        // Save cells map to use when coloring
        calendarContainer.dataset.cellsMap = JSON.stringify(Object.keys(cellsByDate));

        console.log("GitHub calendar created successfully");
        return true;
    } catch (error) {
        console.error("Error creating GitHub calendar:", error);
        calendarContainer.innerHTML = `<div class="alert alert-danger">Error creating calendar: ${error.message}</div>`;
        return false;
    }
}

// Simplified function to generate basic test data
function generateBasicTestData() {
    console.log("Generating basic test data...");

    // Array to store simplified data
    const data = [];

    // Generate data for current year, with very simple format
    for (let month = 0; month < 12; month++) {
        // Get last day of month
        const lastDayOfMonth = new Date(currentYear, month + 1, 0).getDate();

        // Generate between 5-10 entries per month
        const numEntries = Math.floor(Math.random() * 6) + 5;

        for (let i = 0; i < numEntries; i++) {
            // Select random day of month
            const day = Math.floor(Math.random() * lastDayOfMonth) + 1;

            // Create date and normalize it
            const date = new Date(currentYear, month, day);
            date.setHours(0, 0, 0, 0);

            // Random value between 1-5
            const value = Math.floor(Math.random() * 5) + 1;

            // Simple format with UNIX timestamp in seconds
            data.push({
                date: Math.floor(date.getTime() / 1000),
                value: value  // Use 'value' instead of 'count'
            });
        }
    }

    console.log(`Generated ${data.length} basic test data points`);
    return data;
}

// Use simplified function to change year
function changeCalendarYear(offset) {
    console.log(`Changing year: ${currentYear} + ${offset}`);
    currentYear += offset;
    document.getElementById('current-year-label').textContent = currentYear;

    try {
        // Re-initialize calendar with new year
        initializeSimpleCalendar();

        // Reload data
        loadStats();
    } catch (error) {
        console.error("Error changing calendar year:", error);
    }
}

async function loadStats() {
    try {
        console.log("Loading statistics...");
        let contentData;

        // To ensure we have data, use predefined data source
        // in case we can't connect to the API
        try {
            // Try to get data from localStorage
            contentData = JSON.parse(localStorage.getItem('contentData'));
            if (!contentData || contentData.length === 0) {
                throw new Error('No data in localStorage');
            }
            console.log("Data loaded from localStorage:", contentData);
        } catch (error) {
            console.warn("Error loading data:", error);

            // Create simple sample data
            contentData = createSampleData();
            localStorage.setItem('contentData', JSON.stringify(contentData));
            console.log("Sample data created:", contentData);
        }

        console.log(`Processing ${contentData.length} content items`);

        // Update counters
        updateCounters(contentData);

        // Update contribution calendar - simplified implementation
        updateContributionCalendar(contentData);

        // Update activity log
        updateActivityLog(contentData);

    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

function createSampleData() {
    console.log('Generating sample data for the application...');

    const contentData = [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    // Generate a wider set of content (30 items) to have enough data
    for (let i = 0; i < 30; i++) {
        // More distributed publication dates for better visualization
        // To have content distributed across different dates of the year

        // Choose random month and day for each language
        const randomMonthEs = Math.floor(Math.random() * 12);
        const randomDayEs = Math.floor(Math.random() * 28) + 1;
        const publishedEsDate = new Date(currentYear, randomMonthEs, randomDayEs);

        // For English, choose another different date
        const randomMonthEn = Math.floor(Math.random() * 12);
        const randomDayEn = Math.floor(Math.random() * 28) + 1;
        const publishedEnDate = new Date(currentYear, randomMonthEn, randomDayEn);

        // Creation date will be before both publication dates
        // We choose the earliest date between the two publication dates
        const earliestPublishDate = new Date(Math.min(publishedEsDate, publishedEnDate));
        const createdDate = new Date(earliestPublishDate);
        // Go back 1-30 days for creation date
        createdDate.setDate(createdDate.getDate() - (Math.floor(Math.random() * 30) + 1));

        // Determine if published in Spanish and/or English
        const publishedEs = Math.random() < 0.8;
        const publishedEn = Math.random() < 0.8;

        // If not published in either, force at least one
        const finalPublishedEs = (!publishedEs && !publishedEn) ? true : publishedEs;
        const finalPublishedEn = (!publishedEs && !publishedEn) ? Math.random() < 0.5 : publishedEn;

        // Generate platforms randomly
        const platforms = ['YouTube', 'Blog', 'Twitter', 'Instagram', 'Facebook'];
        const randomPlatform = platforms[Math.floor(Math.random() * platforms.length)];

        // Create content with complete data including specific publication dates
        contentData.push({
            id: `content_${i}`,
            title: `Sample Content #${i + 1}`,
            publishedEs: finalPublishedEs,
            publishedEn: finalPublishedEn,
            // Specific publication dates by language - ONLY if published
            publishedEsDate: finalPublishedEs ? publishedEsDate.toISOString() : null,
            publishedEnDate: finalPublishedEn ? publishedEnDate.toISOString() : null,
            // Creation date (should not be used for the calendar)
            createdAt: createdDate.toISOString(),
            platform: randomPlatform,
            tags: "example, sample, test"
        });
    }

    console.log(`Generated ${contentData.length} sample content items`);
    return contentData;
}

function updateCounters(contentData) {
    const totalCount = contentData.length;
    const publishedEsCount = contentData.filter(item => item.publishedEs).length;
    const publishedEnCount = contentData.filter(item => item.publishedEn).length;
    const pendingCount = contentData.filter(item => !item.publishedEs && !item.publishedEn).length;

    document.getElementById('totalContentCount').textContent = totalCount;
    document.getElementById('publishedEsCount').textContent = publishedEsCount;
    document.getElementById('publishedEnCount').textContent = publishedEnCount;
    document.getElementById('pendingCount').textContent = pendingCount;
}

// Simplified function to generate test data
function generateTestData() {
    console.log(`Generating test data for year ${currentYear}...`);

    // Array to store test data
    const data = [];

    // Generate data for current year
    // Create a dataset for each month
    for (let month = 0; month < 12; month++) {
        // Determine last day of month
        const lastDayOfMonth = new Date(currentYear, month + 1, 0).getDate();

        // Generate between 5 and 15 entries per month
        const entriesCount = Math.floor(Math.random() * 10) + 5;

        // To avoid collisions, select random days without repeating
        const selectedDays = new Set();
        while (selectedDays.size < Math.min(entriesCount, lastDayOfMonth)) {
            selectedDays.add(Math.floor(Math.random() * lastDayOfMonth) + 1);
        }

        // Convert to array and generate data
        [...selectedDays].forEach(day => {
            const date = new Date(currentYear, month, day);
            date.setHours(0, 0, 0, 0); // Normalize to midnight

            // Generate random count between 1 and 5
            const count = Math.floor(Math.random() * 5) + 1;

            data.push({
                date: Math.floor(date.getTime() / 1000),
                count: count
            });
        });
    }

    console.log(`Generated ${data.length} test data points`);
    return data;
}

// Color the calendar based on publication data
function updateContributionCalendar(contentData) {
    console.log("Updating GitHub style calendar with PUBLICATION dates...");

    // Inspect data for debugging
    console.log("Sample data of one item:", contentData.length > 0 ?
        JSON.stringify(contentData[0], null, 2) : "No data");

    try {
        // Reload calendar if it doesn't exist
        if (!document.querySelector('.day-cell')) {
            console.log("Calendar not found, recreating...");
            if (!initializeSimpleCalendar()) {
                return;
            }
        }

        // Mapping to count publications by date
        const publicationsByDate = {};
        let totalPublications = 0;

        // Process Spanish and English publications
        contentData.forEach((item, index) => {
            // Process Spanish publications
            if (item.publishedEs) {
                try {
                    let fechaEs = null;

                    // Try to use publishedDateEs (real format) or publishedEsDate (alternative format)
                    if (item.publishedDateEs) {
                        fechaEs = new Date(item.publishedDateEs);

                        // Log to verify dates (only first 5 items)
                        if (index < 5) {
                            console.log(`Item ${index} ES - Using publishedDateEs: ${item.publishedDateEs} -> ${fechaEs.toISOString().split('T')[0]}`);
                        }
                    }
                    // Alternative with other format name
                    else if (item.publishedEsDate) {
                        fechaEs = new Date(item.publishedEsDate);

                        if (index < 5) {
                            console.log(`Item ${index} ES - Using publishedEsDate: ${item.publishedEsDate} -> ${fechaEs.toISOString().split('T')[0]}`);
                        }
                    }
                    // Alternative use of publishedDate ONLY if publishedEsDate doesn't exist
                    else if (item.publishedDate) {
                        fechaEs = new Date(item.publishedDate);
                        if (index < 5) {
                            console.log(`Item ${index} ES - Using publishedDate as fallback: ${item.publishedDate}`);
                        }
                    }
                    // Do not use createdAt in any case

                    if (fechaEs) {
                        // Check if date corresponds to selected year
                        if (fechaEs.getFullYear() === currentYear) {
                            const fechaKey = fechaEs.toISOString().split('T')[0];
                            publicationsByDate[fechaKey] = (publicationsByDate[fechaKey] || 0) + 1;
                            totalPublications++;

                            if (index < 5) {
                                console.log(`Item ${index} ES - Date included in calendar: ${fechaKey} (${currentYear})`);
                            }
                        } else if (index < 5) {
                            console.log(`Item ${index} ES - Date ignored because it's from another year: ${fechaEs.getFullYear()} != ${currentYear}`);
                        }
                    }
                } catch (error) {
                    console.error(`Error processing ES date for item ${index}:`, error);
                }
            } else if (index < 5) {
                console.log(`Item ${index} - Not published in Spanish`);
            }

            // Process English publications
            if (item.publishedEn) {
                try {
                    let fechaEn = null;

                    // Try to use publishedDateEn (real format) or publishedEnDate (alternative format)
                    if (item.publishedDateEn) {
                        fechaEn = new Date(item.publishedDateEn);

                        // Log to verify dates (only first 5 items)
                        if (index < 5) {
                            console.log(`Item ${index} EN - Using publishedDateEn: ${item.publishedDateEn} -> ${fechaEn.toISOString().split('T')[0]}`);
                        }
                    }
                    // Alternative with other format name
                    else if (item.publishedEnDate) {
                        fechaEn = new Date(item.publishedEnDate);

                        if (index < 5) {
                            console.log(`Item ${index} EN - Using publishedEnDate: ${item.publishedEnDate} -> ${fechaEn.toISOString().split('T')[0]}`);
                        }
                    }
                    // Alternative use of publishedDate ONLY if publishedEnDate doesn't exist
                    else if (item.publishedDate) {
                        fechaEn = new Date(item.publishedDate);
                        if (index < 5) {
                            console.log(`Item ${index} EN - Using publishedDate as fallback: ${item.publishedDate}`);
                        }
                    }
                    // Do not use createdAt in any case

                    if (fechaEn) {
                        // Check if date corresponds to selected year
                        if (fechaEn.getFullYear() === currentYear) {
                            const fechaKey = fechaEn.toISOString().split('T')[0];
                            publicationsByDate[fechaKey] = (publicationsByDate[fechaKey] || 0) + 1;
                            totalPublications++;

                            if (index < 5) {
                                console.log(`Item ${index} EN - Date included in calendar: ${fechaKey} (${currentYear})`);
                            }
                        } else if (index < 5) {
                            console.log(`Item ${index} EN - Date ignored because it's from another year: ${fechaEn.getFullYear()} != ${currentYear}`);
                        }
                    }
                } catch (error) {
                    console.error(`Error processing EN date for item ${index}:`, error);
                }
            } else if (index < 5) {
                console.log(`Item ${index} - Not published in English`);
            }
        });

        // Show summary of found dates
        console.log("Publication dates found:", Object.keys(publicationsByDate).sort());

        // Update total publication counter
        const calendarContainer = document.getElementById('publication-calendar');
        const totalCounter = calendarContainer.querySelector('div:first-child');
        if (totalCounter) {
            totalCounter.textContent = `${totalPublications} total publications`;
        }

        console.log(`Total publications: ${totalPublications} in ${Object.keys(publicationsByDate).length} days`);

        // If no data, show informative message
        if (Object.keys(publicationsByDate).length === 0) {
            console.log("No publication data to display in calendar");

            if (totalCounter) {
                totalCounter.textContent = `0 publications found`;
            }
        }

        // Colors based on intensity (GitHub style)
        const colors = [
            'rgba(20, 110, 70, 0.15)', // Level 1 (very low)
            'rgba(20, 110, 70, 0.35)', // Level 2 (low)
            'rgba(20, 110, 70, 0.55)', // Level 3 (medium)
            'rgba(20, 110, 70, 0.75)', // Level 4 (high)
            'rgba(20, 110, 70, 1.0)'   // Level 5 (very high)
        ];

        // Find maximum value for scaling
        const publicationValues = Object.values(publicationsByDate);
        const maxPublications = Math.max(...publicationValues, 1);

        // Color each cell according to its publications
        document.querySelectorAll('.day-cell[data-fecha]').forEach(cell => {
            const date = cell.dataset.fecha;
            if (publicationsByDate[date]) {
                const count = publicationsByDate[date];
                // Normalize value for 5 levels
                const intensityLevel = Math.min(Math.floor((count / maxPublications) * 5), 4);
                cell.style.backgroundColor = colors[intensityLevel];

                // Update tooltip
                const dateObj = new Date(date);
                const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                cell.title = `${dateObj.toLocaleDateString('en-US', options)}\n${count} publication(s)`;
            }
        });

        console.log("GitHub calendar updated successfully");
    } catch (error) {
        console.error("Error updating GitHub calendar:", error);
    }
}

function updateActivityLog(contentData) {
    console.log("Updating activity log...");
    const logContainer = document.getElementById('activity-log');
    logContainer.innerHTML = ''; // Clear previous content

    // Create an array with all publications separated by language
    const publications = [];

    // Add Spanish publications
    contentData.forEach(item => {
        if (item.publishedEs) {
            let fechaEs;
            if (item.publishedDateEs) {
                fechaEs = new Date(item.publishedDateEs);
            } else if (item.publishedEsDate) {
                fechaEs = new Date(item.publishedEsDate);
            } else if (item.publishedDate) {
                fechaEs = new Date(item.publishedDate);
            } else {
                // If no publication date, don't show in log
                return;
            }

            publications.push({
                date: fechaEs,
                title: item.title,
                language: 'ES',
                platform: item.platform || 'YouTube'
            });
        }
    });

    // Add English publications
    contentData.forEach(item => {
        if (item.publishedEn) {
            let fechaEn;
            if (item.publishedDateEn) {
                fechaEn = new Date(item.publishedDateEn);
            } else if (item.publishedEnDate) {
                fechaEn = new Date(item.publishedEnDate);
            } else if (item.publishedDate) {
                fechaEn = new Date(item.publishedDate);
            } else {
                // If no publication date, don't show in log
                return;
            }

            publications.push({
                date: fechaEn,
                title: item.title,
                language: 'EN',
                platform: item.platform || 'YouTube'
            });
        }
    });

    // Sort by date (most recent first)
    publications.sort((a, b) => b.date - a.date);

    // Show only 20 most recent
    const recent = publications.slice(0, 20);

    console.log(`Showing ${recent.length} entries in the log`);

    // Add items to log
    recent.forEach(pub => {
        try {
            // Check if date is valid
            if (isNaN(pub.date.getTime())) {
                console.warn("Invalid date for log:", pub);
                pub.date = new Date(); // Use current date as fallback
            }

            const formattedDate = pub.date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            // Determine language badge
            let langBadge = '';
            if (pub.language === 'ES') {
                langBadge = '<span class="log-badge log-badge-es">ES</span>';
            } else if (pub.language === 'EN') {
                langBadge = '<span class="log-badge log-badge-en">EN</span>';
            }

            // Create table row
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="log-date">${formattedDate}</td>
                <td>${pub.title || 'No title'}</td>
                <td>${langBadge}</td>
                <td>${pub.platform}</td>
                <td>Published</td>
            `;

            logContainer.appendChild(tr);
        } catch (error) {
            console.error("Error processing item for log:", error, pub);
        }
    });

    // If no publications, show message
    if (recent.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="5" class="text-center">No publications recorded</td>';
        logContainer.appendChild(tr);
    }
}