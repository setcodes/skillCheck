import React, { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/shared/ui/card';
import { TagFilter } from '@/shared/ui/tag-filter';
import { QuestionTags } from '@/shared/ui/question-tags';
import { useApp } from '@/app/providers/AppProvider';
import { getQuestions } from '@/shared/api/questions';
import { useToast } from '@/shared/hooks/use-sonner';
import { Send, CheckCircle, Trash2 } from 'lucide-react';

export default function Theory() {
	const { prof, role } = useApp();
	const { toast } = useToast();
	const ALL = getQuestions(prof) || [];
	const cats = useMemo(() => {
		const set = new Set<string>();
		for (const q of (ALL || [])) set.add((q?.category as string) || 'Разное');
		return Array.from(set).sort();
	}, [prof, ALL]);
	
	const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
	
	// Отладочная информация
	useEffect(() => {
		console.log('Selected categories changed:', selectedCategories);
	}, [selectedCategories]);
	
	const list = useMemo(() => {
		return (ALL || [])
			.filter((q: any) => {
				if (selectedCategories.length === 0) return true;
				return selectedCategories.includes((q?.category as string) || 'Разное');
			})
			.sort((a: any, b: any) => {
				const ad = Number.isFinite(a?.difficulty) ? a.difficulty : 0;
				const bd = Number.isFinite(b?.difficulty) ? b.difficulty : 0;
				const dt = ad - bd;
				if (dt !== 0) return dt;
				const at = String(a?.title || '');
				const bt = String(b?.title || '');
				return at.localeCompare(bt);
			});
	}, [ALL, selectedCategories]);

	// Right panel: select question and evaluate
	const [curQ, setCurQ] = useState<string>(ALL[0]?.id || '');
	useEffect(() => {
		setCurQ(ALL[0]?.id || '');
	}, [prof]);
	const cur = useMemo(() => ALL.find((q: any) => q.id === curQ), [ALL, curQ]);

	// Draft per-question evaluation (persisted locally)
	type Draft = { score?: number; comment?: string };
	const DK = `theory.drafts.v1.${prof}`;
	const loadDrafts = (): Record<string, Draft> => {
		try {
			const r = localStorage.getItem(DK);
			if (r) return JSON.parse(r);
		} catch {}
		return {};
	};
	const [drafts, setDrafts] = useState<Record<string, Draft>>(loadDrafts());
	useEffect(() => {
		try {
			localStorage.setItem(DK, JSON.stringify(drafts));
		} catch {}
	}, [drafts, DK]);
	const setScore = (s: number) =>
		cur &&
		setDrafts((a) => ({ ...a, [cur.id]: { ...(a[cur.id] || {}), score: s } }));
	const setComment = (c: string) =>
		cur &&
		setDrafts((a) => ({
			...a,
			[cur.id]: { ...(a[cur.id] || {}), comment: c },
		}));
	const push = () => {
		if (!cur) return;
		const payload = {
			prof,
			questionId: cur.id,
			title: cur.title,
			category: cur.category,
			difficulty: cur.difficulty,
			score: drafts[cur.id]?.score ?? 0,
			comment: drafts[cur.id]?.comment || '',
		};
		const key = 'bridge.theoryScores.v1';
		const bridge = JSON.parse(localStorage.getItem(key) || '{}') as Record<
			string,
			any
		>;
		bridge[prof + ':' + cur.id] = payload;
		localStorage.setItem(key, JSON.stringify(bridge));
		toast.success("Оценка сохранена", "Оценка по теории добавлена в отчёт.");
	};

	return (
		<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
			{/* Questions List */}
			<div className="lg:col-span-2 h-full min-h-0">
				<Card className="h-full flex flex-col">
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle>Теория — {prof}</CardTitle>
							<Button 
								variant="outline" 
								size="sm"
								onClick={()=>{
									// Очищаем все данные об оценках
									localStorage.removeItem("bridge.taskScores.v1"); // Оценки задач
									localStorage.removeItem("bridge.theoryScores.v1"); // Оценки теории
									localStorage.removeItem("solutions.v4"); // Решения задач
									
									// Очищаем черновики теории для всех профессий
									const professions = ['frontend', 'backend-java', 'analyst', 'devops'];
									professions.forEach(prof => {
										localStorage.removeItem(`theory.drafts.v1.${prof}`);
									});
									
									// Показываем уведомление
									toast.success("Все оценки сброшены", "Очищены оценки задач, теории и решения");
									
									// Перезагружаем страницу
									setTimeout(() => location.reload(), 1000);
								}}
								className="inline-flex items-center gap-2"
							>
								<Trash2 className="h-4 w-4" />
								Сброс оценок
							</Button>
						</div>
						<TagFilter
							categories={cats}
							selectedCategories={selectedCategories}
							onCategoriesChange={setSelectedCategories}
							questionCount={list.length}
						/>
					</CardHeader>
					<CardContent className="flex-1 overflow-hidden">
						<div className="h-full overflow-y-auto space-y-4 pr-1">
							{list.map((q: any) => (
								<Card
									key={q.id}
									className={`${cur?.id === q.id ? 'border-primary ring-1 ring-primary' : ''} cursor-pointer transition-colors`}
									onClick={() => setCurQ(q.id)}
								>
									<CardHeader>
										<div className="flex items-start justify-between gap-4">
											<CardTitle className="text-lg flex-1">{q?.title || 'Без названия'}</CardTitle>
											<QuestionTags
												category={q.category || 'Mixed'}
												difficulty={q.difficulty || 1}
												className="flex-shrink-0"
											/>
										</div>
									</CardHeader>
									<CardContent>
										<p className="text-sm text-muted-foreground mb-4">
											{q?.prompt || q?.title || '—'}
										</p>
										{/* Эталонный ответ убран из списка. Доступен в правой подсказке. */}
									</CardContent>
								</Card>
							))}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Right Panel: Evaluation + Hint */}
			<div className="lg:col-span-1 flex flex-col space-y-4 h-full min-h-0">
				{/* Evaluation block */}
				<Card className="h-fit">
					<CardHeader>
						<CardTitle>Оценка</CardTitle>
						<CardDescription>
							Выберите вопрос слева, затем выставьте оценку и комментарий.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						<div className="space-y-1">
							<label className="text-sm font-medium">Текущий вопрос:</label>
							<div className="text-sm">
								{cur ? (
									<>
										<div className="font-medium">{cur.title}</div>
										<div className="text-muted-foreground">
											{cur.category} • сложность {cur.difficulty}
										</div>
									</>
								) : (
									<span className="text-muted-foreground">
										Выберите вопрос из списка слева
									</span>
								)}
							</div>
						</div>
						{role === 'interviewer' ? (
							<>
								<div className="flex items-center gap-2">
									<label className="text-sm">Оценка (0–5):</label>
									<Input
										type="number"
										min={0}
										max={5}
										step={0.5}
										className="w-24"
										value={cur ? (drafts[cur.id]?.score ?? '') : ''}
										onChange={(e) => setScore(Number(e.target.value))}
										disabled={!cur}
									/>
								</div>
								<div className="space-y-1">
									<label className="text-sm">Комментарий:</label>
									<Textarea
										placeholder="Краткая обратная связь"
										value={cur ? drafts[cur.id]?.comment || '' : ''}
										onChange={(e) => setComment(e.target.value)}
										disabled={!cur}
									/>
								</div>
								<div>
									<Button
										variant="outline"
										onClick={push}
										disabled={!cur}
										className="inline-flex items-center gap-2"
									>
										<Send className="h-4 w-4" />
										Отправить оценку
									</Button>
								</div>
							</>
						) : (
							<p className="text-sm text-muted-foreground">
								Оценка доступна только интервьюеру
							</p>
						)}
					</CardContent>
				</Card>

				{/* Hint block */}
				<Card className="flex-1 flex flex-col min-h-0">
					<CardHeader className="flex-shrink-0">
						<CardTitle>Подсказка</CardTitle>
						{cur && <CardDescription>{cur.title}</CardDescription>}
					</CardHeader>
					<CardContent className="flex-1 overflow-hidden">
						{cur && role === 'interviewer' ? (
							<div className="h-full overflow-y-auto">
								<div className="p-3 bg-muted rounded-lg">
									<pre className="text-sm whitespace-pre-wrap">{cur.answer}</pre>
								</div>
							</div>
						) : (
							<p className="text-sm text-muted-foreground">
								В режиме «Кандидат» ответы скрыты.
							</p>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
