/**
 * Класс для представления одной частицы
 */
export class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;

  constructor(x: number, y: number, vx: number, vy: number, life: number, size: number, color: string) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.life = life;
    this.maxLife = life;
    this.size = size;
    this.color = color;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.2;
  }

  /**
   * Обновляет состояние частицы
   * @param deltaTime - Время, прошедшее с последнего кадра (в миллисекундах)
   */
  update(deltaTime: number): void {
    // Применение гравитации
    this.vy += 0.3 * (deltaTime / 16);
    
    // Обновление позиции
    this.x += this.vx * (deltaTime / 16);
    this.y += this.vy * (deltaTime / 16);
    
    // Обновление вращения
    this.rotation += this.rotationSpeed * (deltaTime / 16);
    
    // Уменьшение жизни
    this.life -= deltaTime;
  }

  /**
   * Проверяет, жива ли частица
   */
  isAlive(): boolean {
    return this.life > 0;
  }

  /**
   * Отрисовывает частицу на canvas
   * @param ctx - Контекст canvas для отрисовки
   */
  draw(ctx: CanvasRenderingContext2D): void {
    const alpha = this.life / this.maxLife;
    const currentSize = this.size * alpha;
    
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    
    // Отрисовка частицы (эллипс для лучшей совместимости)
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(0, 0, currentSize / 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }
}

/**
 * Система управления частицами
 */
export class ParticleSystem {
  particles: Particle[] = [];

  /**
   * Создает взрыв частиц в указанной точке
   * @param x - X координата взрыва
   * @param y - Y координата взрыва
   * @param count - Количество частиц (по умолчанию 20)
   * @param color - Цвет частиц (по умолчанию оранжевый)
   */
  emit(x: number, y: number, count: number = 20, color: string = '#FF8C00'): void {
    for (let i = 0; i < count; i++) {
      // Случайная скорость в разных направлениях
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 2 + Math.random() * 4;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      
      // Случайная продолжительность жизни
      const life = 300 + Math.random() * 200;
      
      // Случайный размер
      const size = 3 + Math.random() * 5;
      
      this.particles.push(new Particle(x, y, vx, vy, life, size, color));
    }
  }

  /**
   * Обновляет все частицы
   * @param deltaTime - Время, прошедшее с последнего кадра (в миллисекундах)
   */
  update(deltaTime: number): void {
    // Обновление всех частиц
    this.particles.forEach(particle => particle.update(deltaTime));
    
    // Удаление мертвых частиц
    this.particles = this.particles.filter(particle => particle.isAlive());
  }

  /**
   * Отрисовывает все частицы
   * @param ctx - Контекст canvas для отрисовки
   */
  draw(ctx: CanvasRenderingContext2D): void {
    this.particles.forEach(particle => particle.draw(ctx));
  }

  /**
   * Очищает все частицы
   */
  clear(): void {
    this.particles = [];
  }
}
