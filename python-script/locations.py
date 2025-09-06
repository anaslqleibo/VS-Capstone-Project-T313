import csv

# Open your CSV file
with open("locations.csv", newline='', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile, delimiter=';') 
    
    for row in reader:
        name = row["Location Name"]
        address = row["Street"]
        notes = row["Address Notes"]
        
        sql = f"INSERT INTO locations (name, address, notes) VALUES ('{name}', '{address}','{notes}');"
        print(sql)
