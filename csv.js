let csvData = []; // Store CSV data globally
        let filteredData = []; // Store filtered data

        // Function to parse and display CSV data in a table
        function parseCSV() {
            const csvFilePath = 'replication-data-pnas.csv'; // Replace with the actual CSV file name
            const xhr = new XMLHttpRequest();

            xhr.onreadystatechange = function () {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    if (xhr.status === 200) {
                        const content = xhr.responseText;
                        csvData = parseCSVContent(content);
                        createColumnFilters();
                        updateTable(csvData);
                    } else {
                        console.error('Failed to load CSV file.');
                    }
                }
            };

            xhr.open('GET', csvFilePath, true);
            xhr.send();
        }

        // Function to parse CSV content into an array of objects
        function parseCSVContent(content) {
            const lines = content.split('\n');
            const headers = lines[0].split(',');
            const data = [];

            for (let i = 1; i < lines.length; i++) {
                const rowData = lines[i].split(',');
                if (rowData.length === headers.length) {
                    const rowObj = {};
                    for (let j = 0; j < headers.length; j++) {
                        rowObj[headers[j]] = rowData[j];
                    }
                    data.push(rowObj);
                }
            }
            return data;
        }

        // Function to create individual column filters
        function createColumnFilters() {
            const columnFilters = document.getElementById('columnFilters');
            const headers = Object.keys(csvData[0]);

            headers.forEach(header => {
                const filterDiv = document.createElement('div');
                filterDiv.classList.add('column-filter');

                const label = document.createElement('label');
                label.textContent = header + ':';
                filterDiv.appendChild(label);

                const filterSelect = document.createElement('select');
                filterSelect.classList.add('filter-select');
                filterSelect.innerHTML = '<option value="" selected>Select a value</option>';

                const uniqueValues = [...new Set(csvData.map(row => row[header]))].sort();
                uniqueValues.forEach(value => {
                    const option = document.createElement('option');
                    option.value = value;
                    option.text = value;
                    filterSelect.appendChild(option);
                });

                filterDiv.appendChild(filterSelect);
                columnFilters.appendChild(filterDiv);
            });

            // Add event listener for filtering
            const filterSelects = document.querySelectorAll('.filter-select');
            filterSelects.forEach(select => {
                select.addEventListener('change', applyFilters);
            });
        }

        // Function to apply filters based on user selections
        function applyFilters() {
            const filterSelects = document.querySelectorAll('.filter-select');
            const filterCriteria = {};

            filterSelects.forEach(select => {
                const columnName = select.previousElementSibling.textContent.slice(0, -1); // Remove trailing colon
                const selectedValue = select.value;

                if (selectedValue !== '') {
                    filterCriteria[columnName] = selectedValue;
                }
            });

            // Apply filters
            filteredData = csvData.filter(row => {
                for (const column in filterCriteria) {
                    if (row[column] !== filterCriteria[column]) {
                        return false;
                    }
                }
                return true;
            });

            updateTable(filteredData);
        }

        // Function to update the table with filtered data
        function updateTable(data) {
            const dataTable = document.getElementById('dataTable');
            dataTable.innerHTML = '';

            // Create table headers
            const headerRow = document.createElement('tr');
            const headers = Object.keys(data[0]);
            headers.forEach(headerText => {
                const headerCell = document.createElement('th');
                headerCell.textContent = headerText;
                headerRow.appendChild(headerCell);
            });
            dataTable.appendChild(headerRow);

            // Create table rows
            data.forEach(rowData => {
                const row = document.createElement('tr');
                headers.forEach(header => {
                    const cell = document.createElement('td');
                    cell.textContent = rowData[header];
                    row.appendChild(cell);
                });
                dataTable.appendChild(row);
            });

            filteredData = data; // Store the filtered data for download
        }

        // Function to download filtered data as a CSV
        function downloadCSV() {
            const csvContent = [];

            // Add headers to CSV
            const headers = Object.keys(filteredData[0]);
            csvContent.push(headers.join(','));

            // Add rows to CSV
            filteredData.forEach(row => {
                const values = headers.map(header => row[header]);
                csvContent.push(values.join(','));
            });

            // Create a Blob and trigger download
            const blob = new Blob([csvContent.join('\n')], {
                type: 'text/csv'
            });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'filtered_data.csv';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        }

        // Event listener for Download CSV button
        const downloadCSVButton = document.getElementById('downloadCSV');
        downloadCSVButton.addEventListener('click', downloadCSV);

        // Call the parseCSV function to load and display the CSV data
        parseCSV();