import { gql } from '@apollo/client';

// Main Bank Hierarchy GraphQL Operations
export const GET_QUESTION_BANK_HIERARCHY_ITEMS = gql`
  query GetQuestionBankHierarchyItems {
    questionBankHierarchyItems {
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
      children {
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
        children {
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
          children {
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
            children {
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
          }
        }
      }
    }
  }
`;

export const GET_QUESTION_BANK_HIERARCHY_ITEM = gql`
  query GetQuestionBankHierarchyItem($id: ID!) {
    questionBankHierarchyItem(id: $id) {
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
      children {
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
        children {
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
          children {
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
            children {
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
          }
        }
      }
      parent {
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
    }
  }
`;

export const CREATE_QUESTION_BANK_HIERARCHY_ITEM = gql`
  mutation CreateQuestionBankHierarchyItem($input: CreateHierarchyItemInput!) {
    createQuestionBankHierarchyItem(input: $input) {
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
  }
`;

export const UPDATE_QUESTION_BANK_HIERARCHY_ITEM = gql`
  mutation UpdateQuestionBankHierarchyItem($id: ID!, $input: UpdateHierarchyItemInput!) {
    updateQuestionBankHierarchyItem(id: $id, input: $input) {
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
  }
`;

export const DELETE_QUESTION_BANK_HIERARCHY_ITEM = gql`
  mutation DeleteQuestionBankHierarchyItem($id: ID!) {
    deleteQuestionBankHierarchyItem(id: $id)
  }
`;

export const UPDATE_QUESTION_BANK_QUESTION_COUNT = gql`
  mutation UpdateQuestionBankQuestionCount($id: ID!, $count: Float!) {
    updateQuestionBankQuestionCount(id: $id, count: $count) {
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
  }
`;

export const PUBLISH_QUESTION_BANK_HIERARCHY_ITEM = gql`
  mutation PublishQuestionBankHierarchyItem($id: ID!) {
    publishQuestionBankHierarchyItem(id: $id) {
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
  }
`;

export const UNPUBLISH_QUESTION_BANK_HIERARCHY_ITEM = gql`
  mutation UnpublishQuestionBankHierarchyItem($id: ID!) {
    unpublishQuestionBankHierarchyItem(id: $id) {
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
  }
`;

export const REORDER_QUESTION_BANK_HIERARCHY_ITEMS = gql`
  mutation ReorderQuestionBankHierarchyItems($items: [ReorderHierarchyItemInput!]!) {
    reorderQuestionBankHierarchyItems(items: $items) {
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
  }
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