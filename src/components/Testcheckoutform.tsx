'use client';

import { useState, FormEvent } from 'react';

export default function TestCheckoutForm() {
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [amount, setAmount] = useState('10.00');
  const [result, setResult] = useState('');
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

  // Funções de máscara
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(value);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    setExpiry(value);
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCvc(e.target.value.replace(/\D/g, ''));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('processing');
    setResult('Processando...');

    try {
      const response = await fetch('/api/test-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardNumber: cardNumber.replace(/\s/g, ''),
          cardName,
          expiry,
          cvc,
          amount: parseFloat(amount),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setStatus('success');
        setResult(data.message);
      } else {
        setStatus('error');
        setResult(data.message || 'Erro no pagamento');
      }
    } catch (error: any) {
      setStatus('error');
      setResult('Erro: ' + error.message);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Checkout de Teste</h1>
      <p className="text-sm text-gray-600 mb-6">Digite seus próprios dados de teste fictícios</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-group">
          <label className="block text-sm font-medium mb-1">Número do Cartão</label>
          <input
            type="text"
            value={cardNumber}
            onChange={handleCardNumberChange}
            placeholder="4242 4242 4242 4242"
            maxLength={19}
            required
            className="w-full border border-gray-300 rounded-md p-2"
          />
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium mb-1">Nome no Cartão</label>
          <input
            type="text"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            placeholder="NOME DO CLIENTE"
            required
            className="w-full border border-gray-300 rounded-md p-2"
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Validade (MM/AA)</label>
            <input
              type="text"
              value={expiry}
              onChange={handleExpiryChange}
              placeholder="12/25"
              maxLength={5}
              required
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">CVC</label>
            <input
              type="text"
              value={cvc}
              onChange={handleCvcChange}
              placeholder="123"
              maxLength={4}
              required
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium mb-1">Valor (R$)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="10.00"
            step="0.01"
            min="0.50"
            className="w-full border border-gray-300 rounded-md p-2"
          />
        </div>

        <button
          type="submit"
          disabled={status === 'processing'}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {status === 'processing' ? 'Processando...' : 'Processar Pagamento Teste'}
        </button>
      </form>

      {result && (
        <div
          className={`mt-4 p-3 rounded ${
            status === 'success'
              ? 'bg-green-100 text-green-800'
              : status === 'error'
              ? 'bg-red-100 text-red-800'
              : 'bg-gray-100'
          }`}
        >
          {result}
        </div>
      )}
    </div>
  );
}
