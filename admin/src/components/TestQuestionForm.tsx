import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Question } from '@/types/test';
import { ImageUpload } from '@/components/ImageUpload';

interface TestQuestionFormProps {
    question: Question;
    onChange: (question: Question) => void;
    onDelete: () => void;
}

export function TestQuestionForm({ question, onChange, onDelete }: TestQuestionFormProps) {
    const [optionTexts, setOptionTexts] = useState<string[]>(
        question.options.map(opt => opt.text || '')
    );
    const [optionImages, setOptionImages] = useState<string[]>(
        question.options.map(opt => opt.image || '')
    );

    const handleOptionChange = (index: number, text: string) => {
        const newOptionTexts = [...optionTexts];
        newOptionTexts[index] = text;
        setOptionTexts(newOptionTexts);

        const newOptions = question.options.map((opt, i) => ({
            ...opt,
            text: newOptionTexts[i]
        }));
        onChange({ ...question, options: newOptions });
    };

    const handleOptionImageChange = (index: number, imageUrl: string) => {
        const newOptionImages = [...optionImages];
        newOptionImages[index] = imageUrl;
        setOptionImages(newOptionImages);

        const newOptions = question.options.map((opt, i) => ({
            ...opt,
            image: newOptionImages[i]
        }));
        onChange({ ...question, options: newOptions });
    };

    const handleQuestionImageChange = (imageUrl: string) => {
        onChange({ ...question, questionImage: imageUrl });
    };

    const handleCorrectAnswerChange = (index: number) => {
        onChange({ ...question, correctAnswer: index });
    };

    const handleMarksChange = (marks: number) => {
        onChange({ ...question, marks });
    };

    return (
        <div className="space-y-4 p-4 border rounded-lg">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Question</h3>
                <Button variant="destructive" onClick={onDelete}>Delete</Button>
            </div>

            <div>
                <Label>Question Text</Label>
                <Textarea
                    value={question.question}
                    onChange={(e) => onChange({ ...question, question: e.target.value })}
                    placeholder="Enter your question"
                />
            </div>

            <div>
                <Label>Question Image (Optional)</Label>
                <ImageUpload
                    currentImage={question.questionImage}
                    onImageUpload={handleQuestionImageChange}
                />
            </div>

            <div>
                <Label>Options</Label>
                <div className="space-y-2">
                    {question.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                            <Input
                                value={optionTexts[index]}
                                onChange={(e) => handleOptionChange(index, e.target.value)}
                                placeholder={`Option ${index + 1}`}
                            />
                            <ImageUpload
                                currentImage={optionImages[index]}
                                onImageUpload={(url) => handleOptionImageChange(index, url)}
                            />
                            <Button
                                variant={question.correctAnswer === index ? "default" : "outline"}
                                onClick={() => handleCorrectAnswerChange(index)}
                            >
                                Correct
                            </Button>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <Label>Marks</Label>
                <Input
                    type="number"
                    value={question.marks}
                    onChange={(e) => handleMarksChange(parseInt(e.target.value))}
                    min="1"
                />
            </div>
        </div>
    );
} 