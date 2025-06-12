    let totalMoney = 0;
    let totalPeople = 0;
    let chart;

    function loadSavedPayments() {
      const saved = localStorage.getItem('payments');
      if (saved) {
        const payments = JSON.parse(saved);
        payments.forEach(payment => addPaymentRow(payment.name, payment.amount, payment.date));
        updateTotals(payments);
        updateChart(payments);
      }
    }

    function updateTotals(payments) {
      totalMoney = payments.reduce((sum, p) => sum + p.amount, 0);
      totalPeople = payments.length;
      document.getElementById('money-count').textContent = totalMoney.toFixed(2);
      document.getElementById('people-count').textContent = totalPeople;
    }

    function addPayment() {
      const name = document.getElementById('customer-name').value;
      const amount = parseFloat(document.getElementById('amount').value);
      if (!name) return;
      const date = new Date().toLocaleDateString();
      const payment = { name, amount: isNaN(amount) ? 0 : amount, date };

      addPaymentRow(payment.name, payment.amount, payment.date);

      let payments = JSON.parse(localStorage.getItem('payments')) || [];
      if (payments.length < 100) {
        payments.push(payment);
        localStorage.setItem('payments', JSON.stringify(payments));
      }

      updateTotals(payments);
      updateChart(payments);

      document.getElementById('customer-name').value = '';
      document.getElementById('amount').value = '';
    }

    function addPaymentRow(name, amount, date) {
      const table = document.getElementById('payment-table');
      const row = table.insertRow();
      row.insertCell(0).textContent = table.rows.length;
      row.insertCell(1).textContent = name;
      row.insertCell(2).textContent = `R${amount.toFixed(2)}`;
      row.insertCell(3).textContent = amount > 0 ? 'Paid' : 'Unpaid';
      row.insertCell(4).textContent = date || '';
    }

    function toggleMenu() {
      const links = document.getElementById('navLinks');
      links.classList.toggle('active');
    }

    function clearPayments() {
      if (!confirm('Are you sure you want to clear all payment data?')) return;
      localStorage.removeItem('payments');
      document.getElementById('payment-table').innerHTML = '';
      totalMoney = 0;
      totalPeople = 0;
      document.getElementById('money-count').textContent = '0';
      document.getElementById('people-count').textContent = '0';
      updateChart([]);
    }

    function updateChart(payments) {
      const dailyTotals = {};
      payments.forEach(p => {
        dailyTotals[p.date] = (dailyTotals[p.date] || 0) + p.amount;
      });

      const labels = Object.keys(dailyTotals);
      const data = Object.values(dailyTotals);

      if (chart) chart.destroy();

      const ctx = document.getElementById('trendChart').getContext('2d');
      chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Total per Day (Rand)',
              data,
              backgroundColor: '#2ecc71',
              borderColor: '#27ae60',
              borderWidth: 1
            }
          ]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }

    function applyDateFilter() {
      const start = document.getElementById('filter-date-start').value;
      const end = document.getElementById('filter-date-end').value;
      let payments = JSON.parse(localStorage.getItem('payments')) || [];

      if (start && end) {
        const startDate = new Date(start);
        const endDate = new Date(end);
        payments = payments.filter(p => {
          const paymentDate = new Date(p.date);
          return paymentDate >= startDate && paymentDate <= endDate;
        });
      }

      updateChart(payments);
    }

    window.onload = loadSavedPayments;