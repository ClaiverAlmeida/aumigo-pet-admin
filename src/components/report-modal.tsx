"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { AlertCircle, Loader2 } from "lucide-react";

export interface ReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (reason: string) => void | Promise<void>;
  title?: string;
  description?: string;
  placeholder?: string;
  submitLabel?: string;
  cancelLabel?: string;
  /** Controla loading externamente; se não informado, o modal gerencia internamente durante onSubmit */
  loading?: boolean;
  minLength?: number;
  maxLength?: number;
  required?: boolean;
  /** Modo somente leitura: exibe o motivo existente sem permitir edição */
  readonly?: boolean;
  /** Valor inicial em modo readonly (motivo já reportado) */
  initialValue?: string;
}

export function ReportModal({
  open,
  onOpenChange,
  onSubmit,
  title = "Reportar problema",
  description = "Descreva o problema encontrado. Sua contribuição nos ajuda a melhorar.",
  placeholder = "Descreva detalhadamente o problema...",
  submitLabel = "Enviar reporte",
  cancelLabel = "Cancelar",
  loading,
  minLength = 10,
  maxLength = 500,
  required = true,
  readonly = false,
  initialValue = "",
}: ReportModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [internalLoading, setInternalLoading] = useState(false);

  const isLoading = loading === true ? true : internalLoading;

  useEffect(() => {
    if (open) {
      setReason(readonly ? initialValue : "");
      setError(null);
    }
  }, [open, readonly, initialValue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = reason.trim();

    if (required && !trimmed) {
      setError("Por favor, descreva o problema.");
      return;
    }
    if (trimmed.length < minLength) {
      setError(`A descrição deve ter pelo menos ${minLength} caracteres.`);
      return;
    }
    if (maxLength && trimmed.length > maxLength) {
      setError(`A descrição deve ter no máximo ${maxLength} caracteres.`);
      return;
    }

    setError(null);
    const useInternalLoading = loading === undefined;
    try {
      if (useInternalLoading) setInternalLoading(true);
      await onSubmit(trimmed);
      onOpenChange(false);
    } catch {
      setError("Erro ao enviar. Tente novamente.");
    } finally {
      if (useInternalLoading) setInternalLoading(false);
    }
  };

  const displayValue = readonly ? initialValue : reason;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md sm:max-w-lg"
        onPointerDownOutside={isLoading ? (e) => e.preventDefault() : undefined}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            {readonly ? "Reporte registrado" : title}
          </DialogTitle>
          <DialogDescription>
            {readonly
              ? "Este reporte já foi enviado anteriormente."
              : description}
          </DialogDescription>
        </DialogHeader>

        {readonly ? (
          <div className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Motivo reportado</Label>
              <div className="mt-1 p-4 rounded-lg border bg-muted/50 text-sm whitespace-pre-wrap min-h-[100px]">
                {displayValue || "—"}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="report-reason">
                Motivo {required && <span className="text-red-500">*</span>}
              </Label>
              <Textarea
                id="report-reason"
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  setError(null);
                }}
                placeholder={placeholder}
                rows={4}
                disabled={isLoading}
                maxLength={maxLength}
                className="mt-1 resize-none"
              />
              {maxLength && (
                <p className="text-xs text-muted-foreground mt-1">
                  {reason.length}/{maxLength} caracteres
                </p>
              )}
              {error && (
                <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                {cancelLabel}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  submitLabel
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
