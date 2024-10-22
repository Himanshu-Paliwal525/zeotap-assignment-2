document.addEventListener("DOMContentLoaded", async () => {
    const ctx = document.getElementById("myChart");
    let AllData = [];
    await fetch("http://localhost:3000/dailyChart")
        .then((response) => response.json())
        .then((data) => (AllData = data))
        .catch((err) => console.error(err));
    console.log(AllData);
    const labels = [];
    const tempData = [];
    const feels_like_data = [];
    const threshold = [];
    AllData.forEach((data) => {
        labels.push(data.city);
        tempData.push(data.avg_temp);
        feels_like_data.push(data.feels_like);
        threshold.push(data.threshold);
    });
    console.log(labels, tempData, feels_like_data);
    const chartData = {
        labels,
        datasets: [
            {
                label: "Temperature (°C)",
                data: tempData,
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 3,
            },
            {
                label: "Feels_like (°C)",
                data: feels_like_data,
                backgroundColor: "rgba(255, 99, 132, 0.2)",
                borderColor: "rgba(255, 99, 132, 1)",
                borderWidth: 3,
            },
            {
                label: "Threshold (°C)",
                data: threshold,
                backgroundColor: "rgba(0, 255, 0, 0.2)",
                borderColor: "rgba(0, 255, 0, 1)",
                borderWidth: 3,
            }
        ],
    };

    const myChart = await new Chart(ctx, {
        type: "line",
        data: chartData,
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                },
            },
        },
    });
});
