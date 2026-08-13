'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase'; // Ajusta la ruta a tu lib/supabase

export default function TestDbPage() {
  const [status, setStatus] = useState<'cargando' | 'exito' | 'error'>('cargando');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function testConnection() {
      try {
        // Intentamos leer la tabla customers (aunque esté vacía)
        const { data, error } = await supabase.from('customers').select('id').limit(1);

        if (error) {
          console.error('Error de Supabase:', error);
          setErrorMessage(error.message);
          setStatus('error');
        } else {
          console.log('Respuesta de Supabase:', data);
          setStatus('exito');
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Error desconocido');
        setStatus('error');
      }
    }

    testConnection();
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Prueba de Conexión a Supabase</h1>
      {status === 'cargando' && <p>Conectando con PostgreSQL...</p>}
      {status === 'exito' && (
        <p style={{ color: 'green', fontWeight: 'bold' }}>
          ¡Conexión exitosa! Next.js logró comunicarse con PostgreSQL/Supabase.
        </p>
      )}
      {status === 'error' && (
        <div style={{ color: 'red' }}>
          <p><strong>Error al conectar:</strong> {errorMessage}</p>
          <small>Recuerda revisar tus políticas de RLS o si las llaves en .env.local son correctas.</small>
        </div>
      )}
    </div>
  );
}