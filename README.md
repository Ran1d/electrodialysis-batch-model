# electrodialysis-batch-model
Batch electrodialysis (ED) model for salt removal – comparing linear vs. exponential kinetics. Python (SciPy/Matplotlib) code and one‑page project summary. Preparatory work for PhD application at University of Twente (Membrane Science &amp; Technology).

# Batch Electrodialysis Model for Salt Removal

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A simple Python model to simulate salt concentration decrease over time in a batch electrodialysis (ED) cell. Two ordinary differential equation (ODE) models are compared:

- **Linear model**: constant salt removal rate (`dC/dt = constant`)
- **Exponential model**: removal rate proportional to remaining concentration (`dC/dt ∝ C`)

This project was prepared as a self‑directed preparatory study for a PhD application at the **University of Twente** (Membrane Science and Technology group).

## Objective

Simulate the decrease in salt concentration over time in a single‑compartment ED batch cell and compare the two modeling approaches.

## Governing Equations

Both models solve the following ODE:

- **Linear (constant rate)**  
  `dC/dt = – (I × ε) / (F × V)`

- **Exponential (concentration‑dependent)**  
  `dC/dt = – (I × ε × (C / C₀)) / (F × V)`

where:

| Parameter | Symbol | Value | Unit |
|-----------|--------|-------|------|
| Applied current | `I` | 0.5 | A |
| Current efficiency | `ε` | 0.9 | – |
| Volume of water | `V` | 0.001 (1 L) | m³ |
| Initial concentration | `C₀` | 50 | mol/m³ |
| Simulation time | `t` | 3600 (60 min) | s |
| Faraday constant | `F` | 96485 | C/mol |

<img width="1184" height="731" alt="image" src="https://github.com/user-attachments/assets/c435d6dd-7751-4cba-b8c7-9e058dab755b" />


## How to Run

### Prerequisites
- Python 3.7 or higher
- Required libraries: `numpy`, `matplotlib`, `scipy`

### Install dependencies
```bash
pip install numpy matplotlib scipy
