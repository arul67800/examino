import { gql } from '@apollo/client';

// Previous Papers Hierarchy GraphQL Operations
export const GET_PREVIOUS_PAPERS_HIERARCHY_ITEMS = gql`
  query GetPreviousPapersHierarchyItems {
    previousPapersHierarchyItems {
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

export const GET_PREVIOUS_PAPERS_HIERARCHY_ITEM = gql`
  query GetPreviousPapersHierarchyItem($id: ID!) {
    previousPapersHierarchyItem(id: $id) {
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

export const CREATE_PREVIOUS_PAPERS_HIERARCHY_ITEM = gql`
  mutation CreatePreviousPapersHierarchyItem($input: CreateHierarchyItemInput!) {
    createPreviousPapersHierarchyItem(input: $input) {
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

export const UPDATE_PREVIOUS_PAPERS_HIERARCHY_ITEM = gql`
  mutation UpdatePreviousPapersHierarchyItem($id: ID!, $input: UpdateHierarchyItemInput!) {
    updatePreviousPapersHierarchyItem(id: $id, input: $input) {
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

export const DELETE_PREVIOUS_PAPERS_HIERARCHY_ITEM = gql`
  mutation DeletePreviousPapersHierarchyItem($id: ID!) {
    deletePreviousPapersHierarchyItem(id: $id)
  }
`;

export const UPDATE_PREVIOUS_PAPERS_QUESTION_COUNT = gql`
  mutation UpdatePreviousPapersQuestionCount($id: ID!, $count: Float!) {
    updatePreviousPapersQuestionCount(id: $id, count: $count) {
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

export const PUBLISH_PREVIOUS_PAPERS_HIERARCHY_ITEM = gql`
  mutation PublishPreviousPapersHierarchyItem($id: ID!) {
    publishPreviousPapersHierarchyItem(id: $id) {
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

export const UNPUBLISH_PREVIOUS_PAPERS_HIERARCHY_ITEM = gql`
  mutation UnpublishPreviousPapersHierarchyItem($id: ID!) {
    unpublishPreviousPapersHierarchyItem(id: $id) {
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

export const REORDER_PREVIOUS_PAPERS_HIERARCHY_ITEMS = gql`
  mutation ReorderPreviousPapersHierarchyItems($items: [ReorderHierarchyItemInput!]!) {
    reorderPreviousPapersHierarchyItems(items: $items) {
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

export const GET_PREVIOUS_PAPERS_HIERARCHY_STATS = gql`
  query GetPreviousPapersHierarchyStats {
    previousPapersHierarchyStats {
      level
      type
      count
      totalQuestions
    }
  }
`;