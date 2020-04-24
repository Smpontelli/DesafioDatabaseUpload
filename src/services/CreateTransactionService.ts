import { getCustomRepository, getRepository } from 'typeorm';

import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
	title: string;

	value: number;

	type: 'income' | 'outcome';

	category: string;
}

class CreateTransactionService {
	public async execute({
		title,
		value,
		type,
		category
	}: Request): Promise<Transaction> {
		const transactionsRepository = getCustomRepository(
			TransactionsRepository
		);

		const categoryRepository = getRepository(Category);

		const { total } = await transactionsRepository.getBalance();
		if (type === 'outcome' && value > total) {
			throw new AppError('Saldo insuficiente');
		}

		let titleMatch = await categoryRepository.findOne({
			where: { title: category }
		});

		if (!titleMatch) {
			titleMatch = categoryRepository.create({ title: category });
			await categoryRepository.save(titleMatch);
		}

		const transaction = transactionsRepository.create({
			title,
			value,
			type,
			category: titleMatch
		});

		await transactionsRepository.save(transaction);

		return transaction;
	}
}

export default CreateTransactionService;
