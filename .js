// Elementos do DOM
const amountInput = document.getElementById('amount');
const fromCurrencySelect = document.getElementById('from-currency');
const toCurrencySelect = document.getElementById('to-currency');
const swapBtn = document.getElementById('swap-currencies');
const convertBtn = document.getElementById('convert-btn');
const resultDiv = document.getElementById('result');
const rateDetailsDiv = document.getElementById('rate-details');
const lastUpdateDiv = document.getElementById('last-update');


const API_KEY = '9817543eb9c81cb5ea544e1b';
const API_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/`;

// Taxas de câmbio em cache
let exchangeRates = {};
let lastUpdated = null;

// Moedas mais populares
const popularCurrencies = ['BRL', 'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CNY'];

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    loadCurrencies();
    fetchExchangeRates('BRL');
    
    // Event listeners
    amountInput.addEventListener('input', convert);
    fromCurrencySelect.addEventListener('change', () => {
        fetchExchangeRates(fromCurrencySelect.value);
    });
    toCurrencySelect.addEventListener('change', convert);
    swapBtn.addEventListener('click', swapCurrencies);
    convertBtn.addEventListener('click', convert);
});

// Carrega as moedas nos selects
function loadCurrencies() {
    popularCurrencies.forEach(currency => {
        const option1 = document.createElement('option');
        option1.value = currency;
        option1.textContent = `${currency} - ${getCurrencyName(currency)}`;
        
        const option2 = option1.cloneNode(true);
        
        fromCurrencySelect.appendChild(option1);
        toCurrencySelect.appendChild(option2);
    });
}

// Obtém o nome da moeda
function getCurrencyName(code) {
    const currencyNames = {
        'BRL': 'Real Brasileiro',
        'USD': 'Dólar Americano',
        'EUR': 'Euro',
        'GBP': 'Libra Esterlina',
        'JPY': 'Iene Japonês',
        'CAD': 'Dólar Canadense',
        'AUD': 'Dólar Australiano',
        'CNY': 'Yuan Chinês'
    };
    return currencyNames[code] || code;
}

// Busca as taxas de câmbio da API
async function fetchExchangeRates(baseCurrency) {
    try {
        // Mostra estado de loading
        resultDiv.classList.add('loading');
        rateDetailsDiv.classList.add('loading');
        
        const response = await fetch(`${API_URL}${baseCurrency}`);
        const data = await response.json();
        
        if (data.result === 'success') {
            exchangeRates = data.conversion_rates;
            lastUpdated = new Date(data.time_last_update_utc);
            updateLastUpdate();
            convert();
        } else {
            throw new Error(data['error-type']);
        }
    } catch (error) {
        console.error('Erro ao buscar taxas de câmbio:', error);
        resultDiv.textContent = 'Erro ao carregar taxas';
        rateDetailsDiv.textContent = 'Tente novamente mais tarde';
    } finally {
        resultDiv.classList.remove('loading');
        rateDetailsDiv.classList.remove('loading');
    }
}

// Converte o valor
function convert() {
    const amount = parseFloat(amountInput.value);
    if (isNaN(amount) || amount < 0) {
        resultDiv.textContent = 'Valor inválido';
        return;
    }
    
    const fromCurrency = fromCurrencySelect.value;
    const toCurrency = toCurrencySelect.value;
    
    if (!exchangeRates[toCurrency]) {
        resultDiv.textContent = 'Moeda não disponível';
        return;
    }
    
    const rate = exchangeRates[toCurrency];
    const convertedAmount = (amount * rate).toFixed(4);
    
    resultDiv.textContent = `${amount} ${fromCurrency} = ${convertedAmount} ${toCurrency}`;
    rateDetailsDiv.textContent = `Taxa de câmbio: 1 ${fromCurrency} = ${rate.toFixed(6)} ${toCurrency}`;
}

// Inverte as moedas
function swapCurrencies() {
    const temp = fromCurrencySelect.value;
    fromCurrencySelect.value = toCurrencySelect.value;
    toCurrencySelect.value = temp;
    
    if (exchangeRates[fromCurrencySelect.value]) {
        convert();
    } else {
        fetchExchangeRates(fromCurrencySelect.value);
    }
}

// Atualiza a informação de última atualização
function updateLastUpdate() {
    if (lastUpdated) {
        const options = {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        lastUpdateDiv.textContent = `Atualizado em: ${lastUpdated.toLocaleDateString('pt-BR', options)}`;
    }
}

// Atualiza as taxas periodicamente (a cada hora)
setInterval(() => {
    fetchExchangeRates(fromCurrencySelect.value);
}, 60 * 60 * 1000);