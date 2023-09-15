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
                    populateFilterOptions();
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

    // Function to populate filter options
    function populateFilterOptions() {
        const filterColumn1Select = document.getElementById('filterColumn1');
        const filterValue1Select = document.getElementById('filterValue1');
        const filterColumn2Select = document.getElementById('filterColumn2');
        const filterValue2Select = document.getElementById('filterValue2');

        // Clear existing options
        filterColumn1Select.innerHTML = '';
        filterValue1Select.innerHTML = '<option value="" disabled selected>Select a value</option>';
        filterColumn2Select.innerHTML = '';
        filterValue2Select.innerHTML = '<option value="" disabled selected>Select a value</option>';

        // Add columns as options
        const headers = Object.keys(csvData[0]);
        for (let i = 0; i < headers.length; i++) {
            const option = document.createElement('option');
            option.value = headers[i];
            option.text = headers[i];
            filterColumn1Select.appendChild(option);

            const option2 = document.createElement('option');
            option2.value = headers[i];
            option2.text = headers[i];
            filterColumn2Select.appendChild(option2);
        }

        // Add event listeners for selecting values based on columns
        filterColumn1Select.addEventListener('change', populateValuesBasedOnColumn);
        filterColumn2Select.addEventListener('change', populateValuesBasedOnColumn);
    }

    // Function to populate values based on selected column
    function populateValuesBasedOnColumn() {
        const selectedColumn1 = document.getElementById('filterColumn1').value;
        const selectedColumn2 = document.getElementById('filterColumn2').value;
        const filterValue1Select = document.getElementById('filterValue1');
        const filterValue2Select = document.getElementById('filterValue2');

        const uniqueValues1 = [...new Set(csvData.map(row => row[selectedColumn1]))].sort();
        const uniqueValues2 = [...new Set(csvData.map(row => row[selectedColumn2]))].sort();

        filterValue1Select.innerHTML = '<option value="" disabled selected>Select a value</option>';
        filterValue2Select.innerHTML = '<option value="" disabled selected>Select a value</option>';

        uniqueValues1.forEach(value => {
            const option = document.createElement('option');
            option.value = value;
            option.text = value;
            filterValue1Select.appendChild(option);
        });

        uniqueValues2.forEach(value => {
            const option = document.createElement('option');
            option.value = value;
            option.text = value;
            filterValue2Select.appendChild(option);
        });
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
        const blob = new Blob([csvContent.join('\n')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'filtered_data.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    }

    // Event listener for Apply Filters button
    const applyFiltersButton = document.getElementById('applyFilters');
    applyFiltersButton.addEventListener('click', function () {
        const filterColumn1 = document.getElementById('filterColumn1').value;
        const filterValue1 = document.getElementById('filterValue1').value;
        const filterColumn2 = document.getElementById('filterColumn2').value;
        const filterValue2 = document.getElementById('filterValue2').value;

        // Apply filter
        filteredData = csvData.filter(row => {
            return (filterColumn1 === '' || row[filterColumn1] === filterValue1) &&
                   (filterColumn2 === '' || row[filterColumn2] === filterValue2);
        });

        updateTable(filteredData);
    });

    // Event listener for Download CSV button
    const downloadCSVButton = document.getElementById('downloadCSV');
    downloadCSVButton.addEventListener('click', downloadCSV);

    // Call the parseCSV function to load and display the CSV data
    parseCSV();