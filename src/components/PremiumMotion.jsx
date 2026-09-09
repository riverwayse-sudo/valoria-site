'use client'
import { useEffect } from 'react'
export default function PremiumMotion(){useEffect(()=>{if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;const elements=[...document.querySelectorAll('.au,[data-reveal]')];if(!elements.length)return;const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}}),{threshold:.12,rootMargin:'0px 0px -48px 0px'});elements.forEach(element=>observer.observe(element));return()=>observer.disconnect()},[]);return null}
