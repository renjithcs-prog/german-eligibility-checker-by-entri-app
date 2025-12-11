import React from 'react';

export enum QuestionType {
  SINGLE_CHOICE = 'SINGLE_CHOICE',
  TEXT_INPUT = 'TEXT_INPUT' // Not used in this version but good for extensibility
}

export interface Option {
  id: string;
  label: string;
  value: string;
  icon?: React.ReactNode;
}

export interface Question {
  id: number;
  text: string;
  description?: string;
  options: Option[];
}

export interface UserAnswer {
  questionId: number;
  questionText: string;
  selectedOption: Option;
}

export interface AssessmentResult {
  eligibility: {
    status: 'High' | 'Moderate' | 'Low';
    title: string;
    description: string;
    keyFactors: string[];
  };
  ability: {
    score: number; // 0-100
    financialAnalysis: string;
    languageAnalysis: string;
    academicAnalysis: string;
    recommendation: string;
  };
}