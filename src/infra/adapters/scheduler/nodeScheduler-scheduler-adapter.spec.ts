import { NodeSchedulerAdapter } from './nodeScheduler-scheduler-adapter';
import nodeSchedule from 'node-schedule';

const date = new Date(new Date());
date.setDate(new Date().getDate() + 1);

const makeSut = (): NodeSchedulerAdapter => {
  return new NodeSchedulerAdapter();
};

jest.useFakeTimers();

describe('NodeScheduler Adapter', () => {
  test('Should throw if schedule throws', async () => {
    const sut = makeSut();

    jest.spyOn(nodeSchedule, 'scheduleJob').mockImplementationOnce(() => {
      throw new Error();
    });

    expect(() => sut.create(date, () => {})).toThrow();
  });

  test('Should call scheduleJob method with correct values', async () => {
    const sut = makeSut()

    const compareSpy = jest.spyOn(nodeSchedule, 'scheduleJob')
    await sut.create(date, () => {})

    expect(compareSpy).toHaveBeenCalledWith(date, expect.any(Function))
  })

  test('Should return a job on create success', async () => {
    const sut = makeSut()

    expect(() => sut.create(date, () => {})).toBeTruthy()
  })

  test('Should return a true on cancel success', async () => {
    const sut = makeSut()

    const job = await sut.create(date, () => {})
    const result = sut.cancel(job)

    expect(result).toBe(true)
  })
});
