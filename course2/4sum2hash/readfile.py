import pandas as pd
import time

filepath = 'D:/algorithms-course/course2/4sum2hash/sum2DATA.csv'
t1 = time.time()
testdf = pd.read_csv(filepath, delimiter='\t')
t2 = time.time()
print(f'pd.read_csv() took: {t2 - t1} seconds')