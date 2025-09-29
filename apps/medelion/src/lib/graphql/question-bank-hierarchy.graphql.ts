import { gql } from '@apollo/client';

// Main Bank Hierarchy Fragment for reuse
const QUESTION_BANK_HIERARCHY_FRAGMENT = gql`
  fragment QuestionBankHierarchyItem on HierarchyItem {
    id
    name
    level
    type
    color
    order
    parentId
    questionCount
    isPublished
    createdAt
    updatedAt
  }
`;

// Recursive fragment for nested hierarchy
const QUESTION_BANK_HIERARCHY_TREE_FRAGMENT = gql`
  fragment QuestionBankHierarchyTree on HierarchyItem {
    ...QuestionBankHierarchyItem
    children {
      ...QuestionBankHierarchyItem
      children {
        ...QuestionBankHierarchyItem
        children {
          ...QuestionBankHierarchyItem
          children {
            ...QuestionBankHierarchyItem
            children {
              ...QuestionBankHierarchyItem
            }
          }
        }
      }
    }
  }
  ${QUESTION_BANK_HIERARCHY_FRAGMENT}
`;

export const GET_QUESTION_BANK_HIERARCHY = gql`
  query GetQuestionBankHierarchy {
    questionBankHierarchyItems {
      ...QuestionBankHierarchyTree
    }
  }
  ${QUESTION_BANK_HIERARCHY_TREE_FRAGMENT}
`;

export const GET_QUESTION_BANK_HIERARCHY_ITEM = gql`
  query GetQuestionBankHierarchyItem($id: ID!) {
    questionBankHierarchyItem(id: $id) {
      ...QuestionBankHierarchyTree
      parent {
        ...QuestionBankHierarchyItem
      }
    }
  }
  ${QUESTION_BANK_HIERARCHY_TREE_FRAGMENT}
`;

export const CREATE_QUESTION_BANK_HIERARCHY_ITEM = gql`
  mutation CreateQuestionBankHierarchyItem($input: CreateHierarchyItemInput!) {
    createQuestionBankHierarchyItem(input: $input) {
      ...QuestionBankHierarchyItem
    }
  }
  ${QUESTION_BANK_HIERARCHY_FRAGMENT}
`;

export const UPDATE_QUESTION_BANK_HIERARCHY_ITEM = gql`
  mutation UpdateQuestionBankHierarchyItem($id: ID!, $input: UpdateHierarchyItemInput!) {
    updateQuestionBankHierarchyItem(id: $id, input: $input) {
      ...QuestionBankHierarchyItem
    }
  }
  ${QUESTION_BANK_HIERARCHY_FRAGMENT}
`;

export const DELETE_QUESTION_BANK_HIERARCHY_ITEM = gql`
  mutation DeleteQuestionBankHierarchyItem($id: ID!) {
    deleteQuestionBankHierarchyItem(id: $id)
  }
`;

export const UPDATE_QUESTION_BANK_HIERARCHY_ORDER = gql`
  mutation UpdateQuestionBankHierarchyOrder($items: [ReorderHierarchyItemInput!]!) {
    reorderQuestionBankHierarchyItems(items: $items) {
      ...QuestionBankHierarchyItem
    }
  }
  ${QUESTION_BANK_HIERARCHY_FRAGMENT}
`;

export const UPDATE_QUESTION_BANK_QUESTION_COUNT = gql`
  mutation UpdateQuestionBankQuestionCount($id: ID!, $count: Float!) {
    updateQuestionBankQuestionCount(id: $id, count: $count) {
      ...QuestionBankHierarchyItem
    }
  }
  ${QUESTION_BANK_HIERARCHY_FRAGMENT}
`;

export const GET_QUESTION_BANK_HIERARCHY_STATS = gql`
  query GetQuestionBankHierarchyStats {
    questionBankHierarchyStats {
      level
      type
      count
      totalQuestions
    }
  }
`;

export const PUBLISH_QUESTION_BANK_HIERARCHY_ITEM = gql`
  mutation PublishQuestionBankHierarchyItem($id: ID!) {
    publishQuestionBankHierarchyItem(id: $id) {
      ...QuestionBankHierarchyItem
    }
  }
  ${QUESTION_BANK_HIERARCHY_FRAGMENT}
`;

// Note: This query needs to be implemented in the backend schema
// export const GET_QUESTION_BANK_HIERARCHY_BREADCRUMB = gql`...`