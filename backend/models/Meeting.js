'use strict';

const { Model, DataTypes } = require('sequelize');

/**
 * @param {import('sequelize').Sequelize} sequelize
 * @returns {typeof Meeting}
 */
module.exports = (sequelize) => {
  class Meeting extends Model {}

  Meeting.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: { msg: '会议标题不能为空' },
        },
      },
      meetingTime: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'meeting_time',
      },
      participants: {
        type: DataTypes.STRING(1000),
        allowNull: true,
        comment: '逗号分隔的参会人',
      },
      content: {
        type: DataTypes.TEXT('long'),
        allowNull: true,
      },
      summary: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      decisions: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        /**
         * @returns {string[]}
         */
        get() {
          const raw = this.getDataValue('decisions');
          return Array.isArray(raw) ? raw : [];
        },
      },
      todos: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        /**
         * @returns {{ task: string, completed: boolean }[]}
         */
        get() {
          const raw = this.getDataValue('todos');
          return Array.isArray(raw) ? raw : [];
        },
      },
    },
    {
      sequelize,
      modelName: 'Meeting',
      tableName: 'meetings',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return Meeting;
};
