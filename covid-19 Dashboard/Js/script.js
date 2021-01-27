let UIController = (() => {
    let selectedCountry = 'india';
    //This variable stores all the strings we use in the HTML to identify ids.
    let HTMLStrings = {
        confirmedCount: '#confirmed-count',
        activeCount: '#active-count',
        recoveredCount: '#recovered-count',
        deathCount: '#death-count',
        confirmedCard: '#confirmed-card',
        confirmedChart: '#confirmed-case-chart',
        activeCard: '#active-card',
        recoveredCard: '#recovered-card',
        deathCard: '#death-card',
    };
    //we will be creating 4 variables and looping through the summary data returned by the API.
    let setTotalCasesForStatus = (data) => {
        let confirmed = 0;
        let active = 0;
        let recovered = 0;
        let deaths = 0;

        for (let province of data) {
            confirmed += province['Confirmed'];
            active += province['Active'];
            recovered += province['Recovered'];
            deaths += province['Deaths'];
        }
        document.querySelector(HTMLStrings.confirmedCount).innerText = UIController.numberFormat(confirmed);
        document.querySelector(HTMLStrings.activeCount).innerText = UIController.numberFormat(active);
        document.querySelector(HTMLStrings.recoveredCount).innerText = UIController.numberFormat(recovered);
        document.querySelector(HTMLStrings.deathCount).innerText = UIController.numberFormat(deaths);
    }
    //set the chart colors, for the border of the chart.
    let getChartColors = (status, type) => {
        if (type === 'background') {
            if (status === 'confirmed') {
                return ['rgba(55, 81, 255, 0.2)']
            }
        }
        if (type === 'border') {
            if (status === 'confirmed') {
                return ['rgba(55, 81, 255, 1)']
            }
        }
    }
    //collects the data received from the API & creates a chart for the selected status.
    let setChartForStatus = (data, status = 'confirmed') => {

        let labels = [];
        let chartData = [];
        let months = [ "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December" ];

        for (let i = 0; i < data.length; i = i + 1) {
            let d = new Date(data[i]['Date']);
            labels.push(d.getDate() + " " + months[d.getMonth()]);
            chartData.push(data[i]['Cases']);
        }
        labels.push(new Date().getDate() + " " + months[new Date().getMonth()]);
        chartData.push(data[data.length - 1]['Cases']);

        let chartName = HTMLStrings.confirmedChart;
        if (status === 'active') {
            chartName = HTMLStrings.activeChart;
        }

        if (status === 'recovered') {
            chartName = HTMLStrings.recoveredChart;
        }

        if (status === 'deaths') {
            chartName = HTMLStrings.deathChart;
        }

        let ctx = document.querySelector(chartName);
        let statusChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: status+ ' Cases',
                    data: chartData,
                    backgroundColor: getChartColors(status, 'background'),
                    borderColor: getChartColors(status, 'border'),
                    borderWidth: 2
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: false,
                            stepSize: 10000,
                        }
                    }]
                }
            }
        });
    }


    return {
        //returns the number formatted as per the required locale
        numberFormat(number) {
            return Intl.NumberFormat('en-US').format(number);
        },

        getHTMLStrings() {
            return HTMLStrings;
        },
        //fetches the summary count from the API for the full day.
        //MomentJS is a simple and handy library which lets you manipulate the date and time in JavaScript.
        getSummaryCount() {
            let yesterday = moment().subtract(1, 'days').format().split('T')[0];
            let today = moment().format().split('T')[0];
            axios.get('https://api.covid19api.com/country/' + selectedCountry + '?from=' + yesterday + 'T00:00:00Z&to=' + today + 'T00:00:00Z')
                .then( response => {
                let res = response['data'];
                setTotalCasesForStatus(res);
            });
        },
        //gets the total cases for the status and the delta specified
        getCasesForStatus(status = 'confirmed', delta = 30) {
            let fromDate = moment().subtract(delta, 'days').format().split('T')[0];
            let toDate = moment().format().split('T')[0];
            axios.get('https://api.covid19api.com/total/country/' + selectedCountry + '/status/' + status
                + '?from=' + fromDate + 'T00:00:00Z&to=' + toDate + 'T00:00:00Z').then( response => {
                let res = response['data'];
                setChartForStatus(res, status);
            });
        }
    }
})();

((UIController) => {
    let init = () => {
        UIController.getSummaryCount();
        UIController.getCasesForStatus('confirmed');
    }
    init();

})(UIController);



