from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import time

# open browser
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))

# open deployed app
driver.get("http://localhost:5000")

time.sleep(5)

# print title
print("Page title:", driver.title)

# close browser
driver.quit()