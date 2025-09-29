import { gql } from '@apollo/client';

export const GET_HIERARCHY_ITEMS = gql`
  query GetHierarchyItems {
    hierarchyItems {
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

export const GET_HIERARCHY_ITEM = gql`
  query GetHierarchyItem($id: ID!) {
    hierarchyItem(id: $id) {
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

export const CREATE_HIERARCHY_ITEM = gql`
  mutation CreateHierarchyItem($input: CreateHierarchyItemInput!) {
    createHierarchyItem(input: $input) {
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

export const UPDATE_HIERARCHY_ITEM = gql`
  mutation UpdateHierarchyItem($id: ID!, $input: UpdateHierarchyItemInput!) {
    updateHierarchyItem(id: $id, input: $input) {
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

export const DELETE_HIERARCHY_ITEM = gql`
  mutation DeleteHierarchyItem($id: ID!) {
    deleteHierarchyItem(id: $id)
  }
`;

export const UPDATE_QUESTION_COUNT = gql`
  mutation UpdateQuestionCount($id: ID!, $count: Float!) {
    updateQuestionCount(id: $id, count: $count) {
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

export const PUBLISH_HIERARCHY_ITEM = gql`
  mutation PublishHierarchyItem($id: ID!) {
    publishHierarchyItem(id: $id) {
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

export const UNPUBLISH_HIERARCHY_ITEM = gql`
  mutation UnpublishHierarchyItem($id: ID!) {
    unpublishHierarchyItem(id: $id) {
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

export const REORDER_HIERARCHY_ITEMS = gql`
  mutation ReorderHierarchyItems($items: [ReorderHierarchyItemInput!]!) {
    reorderHierarchyItems(items: $items) {
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

export const GET_HIERARCHY_STATS = gql`
  query GetHierarchyStats {
    hierarchyStats {
      level
      type
      count
      totalQuestions
    }
  }
`;