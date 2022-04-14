export interface Question {
    question: string;
    answer: string;
    order: number;
    _id?: string;
}

export interface QuestionExpandedSettings {
    [key: string]: boolean;
}

export interface QuestionEditSettings {
    editMode: boolean;
    questionId: string;
}