import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import LeetCodeEvaluator from './components/LeetCodeEvaluator';
createRoot(document.getElementById('root')).render(
   <LeetCodeEvaluator></LeetCodeEvaluator>,
)
