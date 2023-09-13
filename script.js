document.addEventListener("DOMContentLoaded", function () {
    const downloadButton = document.getElementById("downloadButton");

    downloadButton.addEventListener("click", function () {
        // Replace this with the path to your CSV file on the local server.
        const csvFilePath = "replication-data-pnas.csv";

        // Create a hidden anchor element to trigger the download.
        const downloadLink = document.createElement("a");
        downloadLink.href = csvFilePath;
        downloadLink.download = "downloaded_file.csv"; // You can set the filename here.

        // Trigger the click event on the anchor element.
        downloadLink.click();
    });
});