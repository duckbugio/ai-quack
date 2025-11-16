import { Position, Velocity, Bounds, CharacterType } from '../../types/game.types';
import {
  GRAVITY,
  JUMP_FORCE,
  MAX_FALL_SPEED,
  DUCK_WIDTH,
  DUCK_HEIGHT,
  DUCK_START_X,
  DUCK_START_Y,
} from '../utils/constants';

/**
 * Класс, представляющий игрового персонажа - утку
 * Управляет позицией, скоростью, физикой и отрисовкой утки
 */
export class Duck {
  position: Position;
  velocity: Velocity;
  width: number;
  height: number;
  character: CharacterType;
  private wingState: 'up' | 'down' = 'up';
  private wingAnimationTimer: number = 0;
  private cachedBounds: Bounds | null = null;
  private lastPositionX: number = DUCK_START_X;
  private lastPositionY: number = DUCK_START_Y;

  constructor(character: CharacterType = CharacterType.CLASSIC) {
    this.position = { x: DUCK_START_X, y: DUCK_START_Y };
    this.velocity = { vx: 0, vy: 0 };
    this.width = DUCK_WIDTH;
    this.height = DUCK_HEIGHT;
    this.character = character;
    this.lastPositionX = DUCK_START_X;
    this.lastPositionY = DUCK_START_Y;
  }

  /**
   * Обновляет позицию утки с учетом гравитации и границ экрана
   * @param deltaTime - Время, прошедшее с последнего кадра (в миллисекундах)
   * @param canvasHeight - Высота canvas для проверки границ
   * @returns true если утка достигла границы экрана (игра окончена)
   */
  update(deltaTime: number, canvasHeight: number): boolean {
    // Применение гравитации (нормализация к 60 FPS)
    this.velocity.vy += GRAVITY * (deltaTime / 16);

    // Ограничение максимальной скорости падения
    if (this.velocity.vy > MAX_FALL_SPEED) {
      this.velocity.vy = MAX_FALL_SPEED;
    }

    // Обновление позиции
    this.position.y += this.velocity.vy * (deltaTime / 16);

    // Проверка верхней границы
    if (this.position.y < 0) {
      this.position.y = 0;
      // Инвалидируем кэш при изменении позиции
      this.cachedBounds = null;
      return true;
    }

    // Проверка нижней границы
    if (this.position.y + this.height > canvasHeight) {
      this.position.y = canvasHeight - this.height;
      // Инвалидируем кэш при изменении позиции
      this.cachedBounds = null;
      return true;
    }

    // Инвалидируем кэш, если позиция изменилась
    if (this.position.x !== this.lastPositionX || this.position.y !== this.lastPositionY) {
      this.cachedBounds = null;
      this.lastPositionX = this.position.x;
      this.lastPositionY = this.position.y;
    }

    // Анимация крыльев (каждые 100ms)
    this.wingAnimationTimer += deltaTime;
    if (this.wingAnimationTimer > 100) {
      this.wingState = this.wingState === 'up' ? 'down' : 'up';
      this.wingAnimationTimer = 0;
    }

    return false;
  }

  /**
   * Выполняет прыжок утки
   * Устанавливает вертикальную скорость вверх и меняет состояние крыльев
   */
  jump(): void {
    this.velocity.vy = JUMP_FORCE;
    this.wingState = this.wingState === 'up' ? 'down' : 'up';
  }

  /**
   * Отрисовывает утку на canvas
   * @param ctx - Контекст canvas для отрисовки
   */
  draw(ctx: CanvasRenderingContext2D): void {
    // Вычисляем угол вращения в зависимости от вертикальной скорости
    // Ограничиваем угол от -30 до 30 градусов для плавности
    const rotation = Math.min(Math.max(this.velocity.vy * 3, -30), 30);
    const rotationRad = (rotation * Math.PI) / 180;

    // Центр утки для вращения
    const centerX = this.position.x + this.width / 2;
    const centerY = this.position.y + this.height / 2;

    // Сохраняем текущее состояние контекста
    ctx.save();

    // Перемещаем начало координат в центр утки и применяем вращение
    ctx.translate(centerX, centerY);
    ctx.rotate(rotationRad);

    // Выбор цветовой схемы в зависимости от персонажа
    const colorsByCharacter: Record<CharacterType, { body: string; beak: string; wing: string; eye?: string }> = {
      [CharacterType.CLASSIC]: { body: '#FFA500', beak: '#FF8C00', wing: '#FF8C00', eye: '#000' },
      [CharacterType.BLUE]: { body: '#1E90FF', beak: '#FFB347', wing: '#187bcd', eye: '#001b2e' },
      [CharacterType.RED]: { body: '#FF4C4C', beak: '#FFB347', wing: '#CC0000', eye: '#1a0000' },
      [CharacterType.NINJA]: { body: '#2F2F2F', beak: '#F2C14E', wing: '#1E1E1E', eye: '#FFFFFF' },
      // Новый оранжевый скин
      [CharacterType.ORANGE]: { body: '#FF9800', beak: '#FB8C00', wing: '#F57C00', eye: '#000' },
    };
    const palette = colorsByCharacter[this.character] ?? colorsByCharacter[CharacterType.CLASSIC];

    // Тело утки (эллипс) - теперь относительно центра
    ctx.fillStyle = palette.body;
    ctx.beginPath();
    ctx.ellipse(
      0,
      0,
      this.width / 2,
      this.height / 2,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Клюв (относительно центра)
    ctx.fillStyle = palette.beak;
    ctx.fillRect(
      this.width / 2 - 10,
      -3,
      8,
      6
    );

    // Крылья (с анимацией) - относительно центра
    const wingOffset = this.wingState === 'up' ? -5 : 5;
    ctx.fillStyle = palette.wing;
    ctx.fillRect(
      -this.width / 2 + 5,
      -5 + wingOffset,
      15,
      8
    );

    // Глаз (относительно центра)
    ctx.fillStyle = palette.eye ?? '#000';
    ctx.fillRect(
      this.width / 2 - 15,
      -7,
      5,
      5
    );

    // Восстанавливаем состояние контекста
    ctx.restore();
  }

  /**
   * Возвращает границы утки для проверки коллизий
   * Использует кэширование для оптимизации производительности
   * @returns Объект с координатами и размерами утки
   */
  getBounds(): Bounds {
    // Возвращаем кэшированные границы, если позиция не изменилась
    if (this.cachedBounds !== null) {
      return this.cachedBounds;
    }

    // Вычисляем и кэшируем границы
    this.cachedBounds = {
      x: this.position.x,
      y: this.position.y,
      width: this.width,
      height: this.height,
    };

    return this.cachedBounds;
  }

  /**
   * Сбрасывает утку в начальное состояние
   */
  reset(): void {
    this.position = { x: DUCK_START_X, y: DUCK_START_Y };
    this.velocity = { vx: 0, vy: 0 };
    this.wingState = 'up';
    this.wingAnimationTimer = 0;
    this.cachedBounds = null;
    this.lastPositionX = DUCK_START_X;
    this.lastPositionY = DUCK_START_Y;
  }

  /**
   * Устанавливает тип персонажа и сбрасывает кэш границ
   */
  setCharacter(character: CharacterType): void {
    this.character = character;
    this.cachedBounds = null;
  }
}
