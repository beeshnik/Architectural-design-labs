init

```plantuml
@startuml  
left to right direction  
actor Гость as g  
package Специалисты {  
  actor "Шеф повар" as c  
  actor "Кулинарный критик" as fc  
}  
package Ресторан {  
  usecase "Есть" as UC1  
  usecase "Платить" as UC2  
  usecase "Пить" as UC3  
  usecase "Составить отзыв" as UC4  
}  
fc --> UC4  
g --> UC1  
g --> UC2  
g --> UC3  
@enduml
```