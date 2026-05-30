import numpy as np
import matplotlib.pyplot as plt
from scipy.integrate import solve_ivp

# Parameters
I = 0.5          # Current (A)
epsilon = 0.9    # Current efficiency
F = 96485        # Faraday constant (C/mol)
V = 0.001        # Volume (m^3) -> 1 L
C0 = 50          # Initial concentration (mol/m^3)
t_end = 3600     # Total time (s)

# Linear model: constant removal rate
def linear_model(t, C):
    return - (I * epsilon) / (F * V)

# Exponential model: rate proportional to remaining concentration
def exp_model(t, C):
    return - (I * epsilon * (C[0] / C0)) / (F * V)

# Time points
t_eval = np.linspace(0, t_end, 300)

# Solve
sol_lin = solve_ivp(linear_model, [0, t_end], [C0], t_eval=t_eval)
sol_exp = solve_ivp(exp_model, [0, t_end], [C0], t_eval=t_eval)

# Plot
plt.figure(figsize=(8, 5))
plt.plot(sol_lin.t/60, sol_lin.y[0], 'b--', linewidth=2, label='Linear model (constant rate)')
plt.plot(sol_exp.t/60, sol_exp.y[0], 'orange', linewidth=2, label='Exponential model (C-dependent)')
plt.xlabel('Time (minutes)')
plt.ylabel('Salt concentration (mol/m³)')
plt.title('Batch Electrodialysis Desalination Model')
plt.legend()
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()

# Print results
print(f"Linear model: Final concentration = {sol_lin.y[0][-1]:.2f} mol/m³, Salt removed = {(1 - sol_lin.y[0][-1]/C0)*100:.1f}%")
print(f"Exponential model: Final concentration = {sol_exp.y[0][-1]:.2f} mol/m³, Salt removed = {(1 - sol_exp.y[0][-1]/C0)*100:.1f}%")
