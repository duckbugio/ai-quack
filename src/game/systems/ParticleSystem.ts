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

  constructor(x: number, y: number, vx: number, vy: number, life: number, size: number, color: string) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.life = life;
    this.maxLife = life;
    this.size = size;
    this.color = color;
  }

  /**
   * Обновляет позицию и время жизни частицы
   * @param deltaTime - Время, прошедшее с последнего кадра (в миллисекундах)
   */
  update(deltaTime: number): void {
    // Применяем гравитацию к частицам
    this.vy += 0.3 * (deltaTime / 16);
    
    // Обновляем позицию
    this.x += this.vx * (deltaTime / 16);
    this.y += this.vy * (deltaTime / 16);
    
    // Уменьшаем время жизни
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
    
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * alpha, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

/**
 * Система управления частицами
 * Создает и управляет частицами для визуальных эффектов
 */
export class ParticleSystem {
  particles: Particle[] = [];

  /**
   * Создает взрыв частиц в указанной точке
   * @param x - X координата центра взрыва
   * @param y - Y координата центра взрыва
   * @param count - Количество частиц (по умолчанию 15)
   * @param color - Цвет частиц (по умолчанию оранжевый)
   */
  emit(x: number, y: number, count: number = 15, color: string = '#FF8C00'): void {
    for (let i = 0; i < count; i++) {
      // Случайное направление движения
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 2 + Math.random() * 3;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      
      // Случайное время жизни
      const life = 300 + Math.random() * 200;
      
      // Случайный размер
      const size = 3 + Math.random() * 4;
      
      this.particles.push(new Particle(x, y, vx, vy, life, size, color));
    }
  }

  /**
   * Обновляет все частицы
   * @param deltaTime - Время, прошедшее с последнего кадра (в миллисекундах)
   */
  update(deltaTime: number): void {
    // Обновляем все частицы
    this.particles.forEach(particle => particle.update(deltaTime));
    
    // Удаляем мертвые частицы
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
