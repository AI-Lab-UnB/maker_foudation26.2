# Lista de dicionarios de pick-ups


pickups = [{'name': 'Amarok', 'brand': 'Volkswagen', 'year': 2023},
        {'name': 'Ranger', 'brand': 'Ford', 'year': 2024},
        {'name': 'S10', 'brand': 'Chevrolet', 'year': 2017},
        {'name': 'Hilux', 'brand': 'Toyota', 'year': 2020},
        ]

pickup_names = sorted(pickups, key=lambda x: x['name']) # Ordenaçao por nomes
pickup_brands = sorted(pickups, key=lambda x: x['brand']) # Ordenaçao por marcas
pickup_years = sorted(pickups, key=lambda x: x['year']) # Ordenaçao por ano

print(pickup_names)
print(pickup_brands)
print(pickup_years)