import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'; // Corrigido
import { Button } from './components/ui/button'; // Corrigido
import { Input } from './components/ui/input'; // Corrigido
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select'; // Corrigido
import { supabase } from './supabase'; // Importando a configuração do Supabase

const FinanceApp = () => {
  const [transactions, setTransactions] = useState([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (error) console.error('Error fetching transactions:', error);
    else setTransactions(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newTransaction = {
      description,
      amount: type === 'expense' ? -Number(amount) : Number(amount),
      type,
      date: new Date().toISOString().split('T')[0],
    };

    const { data, error } = await supabase
      .from('transactions')
      .insert([newTransaction]);

    if (error) console.error('Error inserting transaction:', error);
    else {
      setTransactions([...transactions, data[0]]);
      setDescription('');
      setAmount('');
      setType('expense');
    }
  };

  const deleteTransaction = async (id) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .match({ id });

    if (error) console.error('Error deleting transaction:', error);
    else setTransactions(transactions.filter(t => t.id !== id));
  };

  const balance = transactions.reduce((acc, curr) => acc + curr.amount, 0);

  const chartData = transactions.map(t => ({
    date: t.date,
    amount: t.amount,
  }));

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Finanças Pessoais</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Adicionar Transação</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Descrição"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
              <Input
                type="number"
                placeholder="Valor"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de transação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Despesa</SelectItem>
                  <SelectItem value="income">Receita</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Saldo Atual</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-4xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {balance.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Histórico de Transações</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {transactions.map(t => (
              <li key={
