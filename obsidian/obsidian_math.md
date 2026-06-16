---
type: manual
status: active
rating: 5
created: 2026-06-15
tags:
  - bitcoin
  - cryptography
---


# Matematika v Obsidianu

Obsidian podporuje zápis matematických výrazů pomocí **LaTeXu**.


$$
H(X) = -\sum_{i=1}^{n} p_i \log_2(p_i)
$$
pro minci:

$$
H(X) =  
-\left(  
\frac{1}{2}\log_2\frac{1}{2}  
+  
\frac{1}{2}\log_2\frac{1}{2}  
\right)  
= 1
$$

---


## Řádková matematika

Matematický výraz lze vložit přímo do textu mezi znaky `$`.

Příklad:

```text
Pythagorova věta: $a^2+b^2=c^2$
```

Výsledek:

Pythagorova věta: $a^2+b^2=c^2$

---

## Matematický blok

Pro větší vzorce použij:

```text
$$
...
$$
```

Příklad:

```text
$$
a^2+b^2=c^2
$$
```

---

## Mocniny a indexy

```text
$$
x^2
$$

$$
x^{10}
$$

$$
a_1 + a_2 + a_n
$$
```

---

## Zlomky

```text
$$
\frac{a}{b}
$$
```

```text
$$
\frac{x^2+y^2}{z}
$$
```

---

## Odmocniny

```text
$$
\sqrt{x}
$$
```

```text
$$
\sqrt{x^2+y^2}
$$
```

```text
$$
sqrt[3]{8}
$$
```

---

## Řecká písmena

```text
$$
\alpha,\beta,\gamma,\delta,\epsilon
$$
```

```text
$$
\lambda,\mu,\pi,\sigma,\omega
$$
```

---

## Součty a součiny

```text
$$
\sum_{i=1}^{n} i
$$
```

```text
$$
\prod_{i=1}^{n} i
$$
```

---

## Integrály

```text
$$
\int x^2\,dx
$$
```

```text
$$
\int_a^b f(x)\,dx
$$
```

---

## Limity

```text
$$
\lim_{x \to 0} \frac{\sin x}{x}
$$
```

---

## Matice

```text
$$
\begin{bmatrix}
1 & 2 \\
3 & 4
\end{bmatrix}
$$
```

---

## Soustava rovnic

```text
$$
\begin{cases}
x+y=5 \\
x-y=1
\end{cases}
$$
```

$$
\begin{cases}
x+y=5 \\
x-y=1
\end{cases}
$$
---

## Zarovnání více řádků

```text
$$
\begin{aligned}
a+b &= c \\
d+e &= f
\end{aligned}
$$
```

---

## Nekonečno a speciální symboly

```text
$$
\infty
$$
```

```text
$$
\forall x \in A
$$
```

```text
$$
\exists x
$$
```

```text
$$
A \subseteq B
$$
```

```text
$$
A \cup B
$$
```

```text
$$
A \cap B
$$
```

---

## Pravděpodobnost

```text
$$
P(A)
$$
```

```text
$$
P(A \mid B)
$$
```

```text
$$
E[X]
$$
```

```text
$$
Var(X)
$$
```

---

## Bitcoin a kryptografie

Hash:

```text
$$
H(m)
$$
```

Digitální podpis:

```text
$$
s = k^{-1}(z+r \cdot d) \bmod n
$$
```

$$
s = k^{-1}(z+r \cdot d) \bmod n
$$
Eliptická křivka:

```text
$$
y^2 = x^3 + 7
$$
```

Veřejný klíč:

```text
$$
Q=dG
$$
```

---

## Tipy

- Mocnina: `x^2`
    
- Dolní index: `x_1`
    
- Zlomek: `\frac{a}{b}`
    
- Odmocnina: `\sqrt{x}`
    
- Součet: `\sum`
    
- Integrál: `\int`
    
- Nekonečno: `\infty`
    
- Řecká písmena: `\alpha`, `\beta`, `\gamma`, `\pi`, `\omega`
    

Pro většinu matematiky v Obsidianu stačí pamatovat:

```text
$ ... $      řádkový vzorec

$$
...
$$            matematický blok
```


---
#obsidian 