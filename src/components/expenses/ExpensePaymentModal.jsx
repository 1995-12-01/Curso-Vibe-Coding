/**
 * @file ExpensePaymentModal.jsx
 * @description Modal para registrar una contribución / pago a un gasto.
 * Incluye monto, comentario explicativo obligatorio y subida de comprobante
 * con vista previa inmediata y efecto confetti al completar el total.
 */

import React, { useState } from 'react';
import { CreditCard, DollarSign, Upload, Image as ImageIcon, MessageSquare, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import Button from '../common/Button';
import { uploadPaymentReceipt } from '../../data/storageRepo';
import { addPaymentContribution } from '../../data/expensesRepo';
import { validatePaymentContribution } from '../../domain/validations';
import { EXPENSE_STATUSES } from '../../domain/constants';

export default function ExpensePaymentModal({
  isOpen,
  onClose,
  expense,
  currentUser,
  onPaymentSuccess,
}) {
  if (!expense) return null;

  const totalAmount = Number(expense.amount || 0);
  const totalPaid = Number(expense.totalPaid || 0);
  const remaining = Math.max(0, totalAmount - totalPaid);

  const [amount, setAmount] = useState(remaining.toString());
  const [comment, setComment] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Manejar selección de imagen de comprobante
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      const previewUrl = URL.createObjectURL(file);
      setReceiptPreview(previewUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const paymentData = {
      amount,
      comment,
      uid: currentUser.uid,
      userName: currentUser.displayName,
    };

    const validation = validatePaymentContribution(paymentData, expense);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setSubmitting(true);
    try {
      // 1. Subir comprobante a Firebase Storage (o fallback DataURL)
      let receiptUrl = '';
      if (receiptFile) {
        receiptUrl = await uploadPaymentReceipt(receiptFile, expense.id);
      }

      // 2. Registrar contribución
      const result = await addPaymentContribution(expense.id, {
        ...paymentData,
        receiptUrl,
      });

      // 3. Si se completó el pago en su totalidad, lanzar confeti festivo
      if (result.newStatus === EXPENSE_STATUSES.PAID.id) {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch (e) {}
      }

      // Resetear formulario
      setAmount('');
      setComment('');
      setReceiptFile(null);
      setReceiptPreview('');
      setErrors({});
      onClose();

      if (onPaymentSuccess) onPaymentSuccess(result);
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Registrar Aporte: ${expense.name}`}
      icon={CreditCard}
    >
      <div style={{
        backgroundColor: 'var(--bg-surface-alt)',
        border: '2px solid var(--border-color)',
        borderRadius: '10px',
        padding: '0.75rem 1rem',
        marginBottom: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>
            SALDO PENDIENTE
          </span>
          <p style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-heading-color)', margin: 0 }}>
            ${remaining.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            Total presupuestado
          </span>
          <p style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            ${totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Monto a aportar */}
        <Input
          label="Monto aportado ($)"
          required
          type="number"
          min="0.01"
          step="0.01"
          placeholder="0.00"
          icon={DollarSign}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          error={errors.amount}
          helperText={`Puedes ingresar el saldo total ($${remaining}) o una cantidad parcial.`}
        />

        {/* Comentario explicativo obligatorio */}
        <Textarea
          label="Comentario obligatorio"
          required
          placeholder="Explica este pago (ej. 'Pago con tarjeta terminación 1234', 'Aporto la mitad porque me faltó efectivo', etc.)."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          error={errors.comment}
          helperText="El comentario es requerido para que todos en el hogar conozcan el motivo del importe."
        />

        {/* Subida de evidencia de pago */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label className="flat-label">
            Evidencia o comprobante de pago (Opcional)
          </label>

          <label
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.25rem',
              border: '2px dashed var(--border-color)',
              borderRadius: '10px',
              backgroundColor: 'var(--bg-surface-alt)',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease',
            }}
          >
            <Upload size={24} color="var(--user-accent)" style={{ marginBottom: '6px' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {receiptFile ? receiptFile.name : 'Selecciona una foto o captura del comprobante'}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Formatos PNG, JPG o captura bancaria
            </span>
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </label>

          {/* Vista previa de la imagen */}
          {receiptPreview && (
            <div style={{ marginTop: '0.75rem', position: 'relative' }}>
              <img
                src={receiptPreview}
                alt="Vista previa del comprobante"
                style={{
                  maxHeight: '120px',
                  borderRadius: '8px',
                  border: '2px solid var(--border-color)',
                  objectFit: 'cover',
                }}
              />
            </div>
          )}
        </div>

        {errors.general && (
          <p style={{ color: '#EF4444', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.75rem' }}>
            {errors.general}
          </p>
        )}

        {errors.form && (
          <p style={{ color: '#EF4444', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.75rem' }}>
            {errors.form}
          </p>
        )}

        {/* Botones de acción */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? 'Registrando aporte...' : 'Confirmar Aporte'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
