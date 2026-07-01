/**
 * Type declarations for UI components
 *
 * This file provides TypeScript declarations for UI components that are
 * imported from JSX files.
 */

declare module "@/components/ui/button" {
  import { ButtonHTMLAttributes } from "react";

  export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?:
      | "default"
      | "destructive"
      | "outline"
      | "secondary"
      | "ghost"
      | "link";
    size?: "default" | "sm" | "lg" | "icon";
    asChild?: boolean;
  }

  export const Button: React.FC<ButtonProps>;
}

declare module "@/components/ui/input" {
  import { InputHTMLAttributes } from "react";

  export type InputProps = InputHTMLAttributes<HTMLInputElement>;

  export const Input: React.FC<InputProps>;
}

declare module "@/components/ui/card" {
  import { HTMLAttributes } from "react";

  export type CardProps = HTMLAttributes<HTMLDivElement>;
  export type CardHeaderProps = HTMLAttributes<HTMLDivElement>;
  export type CardTitleProps = HTMLAttributes<HTMLHeadingElement>;
  export type CardDescriptionProps = HTMLAttributes<HTMLParagraphElement>;
  export type CardContentProps = HTMLAttributes<HTMLDivElement>;
  export type CardFooterProps = HTMLAttributes<HTMLDivElement>;

  export const Card: React.FC<CardProps>;
  export const CardHeader: React.FC<CardHeaderProps>;
  export const CardTitle: React.FC<CardTitleProps>;
  export const CardDescription: React.FC<CardDescriptionProps>;
  export const CardContent: React.FC<CardContentProps>;
  export const CardFooter: React.FC<CardFooterProps>;
}

declare module "@/components/ui/dialog" {
  import { HTMLAttributes, ReactNode } from "react";

  export interface DialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children?: ReactNode;
  }

  export interface DialogTriggerProps {
    asChild?: boolean;
    children?: ReactNode;
  }

  export interface DialogContentProps extends HTMLAttributes<HTMLDivElement> {
    onEscapeKeyDown?: (event: KeyboardEvent) => void;
    onPointerDownOutside?: (event: PointerEvent) => void;
    onInteractOutside?: (event: React.SyntheticEvent) => void;
    forceMount?: boolean;
    children?: ReactNode;
  }

  export const Dialog: React.FC<DialogProps>;
  export const DialogTrigger: React.FC<DialogTriggerProps>;
  export const DialogContent: React.FC<DialogContentProps>;
  export const DialogHeader: React.FC<
    HTMLAttributes<HTMLDivElement> & { children?: ReactNode }
  >;
  export const DialogFooter: React.FC<
    HTMLAttributes<HTMLDivElement> & { children?: ReactNode }
  >;
  export const DialogTitle: React.FC<
    HTMLAttributes<HTMLHeadingElement> & { children?: ReactNode }
  >;
  export const DialogDescription: React.FC<
    HTMLAttributes<HTMLParagraphElement> & { children?: ReactNode }
  >;
}

declare module "@/components/ui/radio-group" {
  import { InputHTMLAttributes, ReactNode } from "react";

  export interface RadioGroupProps {
    value?: string;
    onValueChange?: (value: string) => void;
    defaultValue?: string;
    children?: ReactNode;
  }

  export interface RadioGroupItemProps extends InputHTMLAttributes<HTMLInputElement> {
    value: string;
  }

  export const RadioGroup: React.FC<RadioGroupProps>;
  export const RadioGroupItem: React.FC<RadioGroupItemProps>;
}

declare module "@/components/ui/label" {
  import { LabelHTMLAttributes, ReactNode } from "react";

  export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
    htmlFor?: string;
    children?: ReactNode;
  }

  export const Label: React.FC<LabelProps>;
}
