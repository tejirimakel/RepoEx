# GitHub Repository Explorer

## Overview

A modern single-page application built with Vue 3 (Composition API) that allows users to search GitHub repositories, view detailed information, and manage favorites locally.
This project emphasizes clean architecture, performance, scalability, and user experience, aligning with real-world frontend engineering practices.

## Tech Stack

Vue 3
Vue Router
Tailwind CSS
GitHub REST API

## Project Setup

This project was scaffolded using Vite for a fast and modern development experience,
aligned with current Vue 3 best practices.

## Installation

npm install
npm run dev

## Features

Search repositories
View repository details
Save favorites locally

## Architecture Decisions

API logic separated into service layer
Favorites managed using Vue composables and localStorage
Vue Router used for client-side navigation

## Future Improvements

Pagination
Unit tests
Debounced search

## Additional Feature

This project displays **top contributors** for each repository.

Reason:
I chose contributors because it provides insight into active collaboration
and is more user-friendly than raw issue data.
