import {
    ConditionalRule,
    DateFilterRule,
    DimensionType,
    FilterOperator,
    formatDate,
    isDimension,
    isField,
    isFilterRule,
    isWeekDay,
    parseDate,
    TimeFrames,
} from '@lightdash/common';
import { Flex, NumberInput, Text } from '@mantine/core';
import moment from 'moment';
import React from 'react';
import MonthAndYearInput from '../../MonthAndYearInput';
import WeekPicker from '../../WeekPicker';
import YearInput from '../../YearInput';
import { useFiltersContext } from '../FiltersProvider';
import { getPlaceholderByFilterTypeAndOperator } from '../utils/getPlaceholderByFilterTypeAndOperator';
import DatePicker from './DatePicker';
import DateTimePicker from './DateTimePicker';
import { getFirstDayOfWeek, normalizeWeekDay } from './dateUtils';
import DefaultFilterInputs, { FilterInputsProps } from './DefaultFilterInputs';
import {
    MultipleInputsWrapper,
    StyledDateRangeInput,
} from './FilterInputs.styles';
import UnitOfTimeAutoComplete from './UnitOfTimeAutoComplete';

const DateFilterInputs = <T extends ConditionalRule = DateFilterRule>(
    props: React.PropsWithChildren<FilterInputsProps<T>>,
) => {
    const { field, rule, onChange, popoverProps, disabled, filterType } = props;
    const { startOfWeek } = useFiltersContext();
    const isTimestamp =
        isField(field) && field.type === DimensionType.TIMESTAMP;

    if (!isFilterRule(rule)) {
        throw new Error('DateFilterInputs expects a FilterRule');
    }

    const placeholder = getPlaceholderByFilterTypeAndOperator({
        type: filterType,
        operator: rule.operator,
        disabled: rule.disabled && !rule.values,
    });

    switch (rule.operator) {
        case FilterOperator.EQUALS:
        case FilterOperator.NOT_EQUALS:
        case FilterOperator.GREATER_THAN:
        case FilterOperator.GREATER_THAN_OR_EQUAL:
        case FilterOperator.LESS_THAN:
        case FilterOperator.LESS_THAN_OR_EQUAL:
            if (isDimension(field) && field.timeInterval) {
                switch (field.timeInterval.toUpperCase()) {
                    case TimeFrames.WEEK:
                        return (
                            <Flex align="center" gap="xs" w="100%">
                                <Text
                                    color="gray"
                                    sx={{ whiteSpace: 'nowrap' }}
                                >
                                    week commencing
                                </Text>

                                <WeekPicker
                                    placeholder={placeholder}
                                    disabled={disabled}
                                    value={rule.values ? rule.values[0] : null}
                                    // FIXME: mantine v7
                                    // mantine does not set the first day of the week based on the locale
                                    // so we need to do it manually and always pass it as a prop
                                    firstDayOfWeek={getFirstDayOfWeek(
                                        startOfWeek,
                                    )}
                                    // FIXME: remove this once we migrate off of Blueprint
                                    // we are doing type conversion here because Blueprint expects DOM element
                                    // Mantine does not provide a DOM element on onOpen/onClose
                                    popoverProps={{
                                        onOpen: () =>
                                            popoverProps?.onOpened?.(
                                                null as any,
                                            ),
                                        onClose: () =>
                                            popoverProps?.onClose?.(
                                                null as any,
                                            ),
                                    }}
                                    onChange={(value: Date | null) => {
                                        onChange({
                                            ...rule,
                                            values:
                                                value === null
                                                    ? undefined
                                                    : [moment(value).toDate()],
                                        });
                                    }}
                                />
                            </Flex>
                        );
                    case TimeFrames.MONTH:
                        return (
                            <MonthAndYearInput
                                disabled={disabled}
                                placeholder={placeholder}
                                // FIXME: remove this once we migrate off of Blueprint
                                // we are doing type conversion here because Blueprint expects DOM element
                                // Mantine does not provide a DOM element on onOpen/onClose
                                popoverProps={{
                                    onOpen: () =>
                                        popoverProps?.onOpened?.(null as any),
                                    onClose: () =>
                                        popoverProps?.onClose?.(null as any),
                                }}
                                value={
                                    rule.values && rule.values[0]
                                        ? parseDate(
                                              formatDate(
                                                  rule.values[0],
                                                  TimeFrames.MONTH,
                                              ),
                                              TimeFrames.MONTH,
                                          )
                                        : null
                                }
                                onChange={(value: Date) => {
                                    onChange({
                                        ...rule,
                                        values: [
                                            formatDate(value, TimeFrames.MONTH),
                                        ],
                                    });
                                }}
                            />
                        );
                    case TimeFrames.YEAR:
                        return (
                            <YearInput
                                disabled={disabled}
                                placeholder={placeholder}
                                // FIXME: remove this once we migrate off of Blueprint
                                // we are doing type conversion here because Blueprint expects DOM element
                                // Mantine does not provide a DOM element on onOpen/onClose
                                popoverProps={{
                                    onOpen: () =>
                                        popoverProps?.onOpened?.(null as any),
                                    onClose: () =>
                                        popoverProps?.onClose?.(null as any),
                                }}
                                value={
                                    rule.values && rule.values[0]
                                        ? parseDate(
                                              formatDate(
                                                  rule.values[0],
                                                  TimeFrames.YEAR,
                                              ),
                                              TimeFrames.YEAR,
                                          )
                                        : null
                                }
                                onChange={(newDate: Date) => {
                                    onChange({
                                        ...rule,
                                        values: [
                                            formatDate(
                                                newDate,
                                                TimeFrames.YEAR,
                                            ),
                                        ],
                                    });
                                }}
                            />
                        );
                    default:
                        break;
                }
            }

            if (isTimestamp) {
                return (
                    <DateTimePicker
                        disabled={disabled}
                        placeholder={placeholder}
                        withSeconds
                        // FIXME: mantine v7
                        // mantine does not set the first day of the week based on the locale
                        // so we need to do it manually and always pass it as a prop
                        firstDayOfWeek={getFirstDayOfWeek(startOfWeek)}
                        // FIXME: remove this once we migrate off of Blueprint
                        // we are doing type conversion here because Blueprint expects DOM element
                        // Mantine does not provide a DOM element on onOpen/onClose
                        popoverProps={{
                            onOpen: () => popoverProps?.onOpened?.(null as any),
                            onClose: () => popoverProps?.onClose?.(null as any),
                        }}
                        value={rule.values ? rule.values[0] : null}
                        onChange={(value: Date | null) => {
                            onChange({
                                ...rule,
                                values:
                                    value === null
                                        ? undefined
                                        : [moment(value).toDate()],
                            });
                        }}
                    />
                );
            }

            return (
                <DatePicker
                    disabled={disabled}
                    placeholder={placeholder}
                    // FIXME: mantine v7
                    // mantine does not set the first day of the week based on the locale
                    // so we need to do it manually and always pass it as a prop
                    firstDayOfWeek={getFirstDayOfWeek(startOfWeek)}
                    // FIXME: remove this once we migrate off of Blueprint
                    // we are doing type conversion here because Blueprint expects DOM element
                    // Mantine does not provide a DOM element on onOpen/onClose
                    popoverProps={{
                        onOpen: () => popoverProps?.onOpened?.(null as any),
                        onClose: () => popoverProps?.onClose?.(null as any),
                    }}
                    value={rule.values ? rule.values[0] : null}
                    onChange={(value: Date | null) => {
                        onChange({
                            ...rule,
                            values:
                                value === null
                                    ? undefined
                                    : [moment(value).toDate()],
                        });
                    }}
                />
            );
        case FilterOperator.IN_THE_PAST:
        case FilterOperator.NOT_IN_THE_PAST:
        case FilterOperator.IN_THE_NEXT:
            const parsedValue = parseInt(rule.values?.[0], 10);
            return (
                <Flex gap="xs" w="100%">
                    <NumberInput
                        size="xs"
                        sx={{ flexShrink: 1, flexGrow: 1 }}
                        placeholder={placeholder}
                        disabled={disabled}
                        value={isNaN(parsedValue) ? undefined : parsedValue}
                        min={0}
                        onChange={(value) => {
                            onChange({
                                ...rule,
                                values: value === '' ? [] : [value],
                            });
                        }}
                    />

                    <UnitOfTimeAutoComplete
                        disabled={disabled}
                        sx={{ flexShrink: 0, flexGrow: 3 }}
                        isTimestamp={isTimestamp}
                        unitOfTime={rule.settings?.unitOfTime}
                        completed={rule.settings?.completed || false}
                        popoverProps={popoverProps}
                        onChange={(value) =>
                            onChange({
                                ...rule,
                                settings: {
                                    unitOfTime: value.unitOfTime,
                                    completed: value.completed,
                                },
                            })
                        }
                    />
                </Flex>
            );
        case FilterOperator.IN_THE_CURRENT:
            return (
                <UnitOfTimeAutoComplete
                    w="100%"
                    disabled={disabled}
                    isTimestamp={isTimestamp}
                    unitOfTime={rule.settings?.unitOfTime}
                    showOptionsInPlural={false}
                    showCompletedOptions={false}
                    completed={false}
                    popoverProps={popoverProps}
                    onChange={(value) =>
                        onChange({
                            ...rule,
                            settings: {
                                unitOfTime: value.unitOfTime,
                                completed: false,
                            },
                        })
                    }
                />
            );
        case FilterOperator.IN_BETWEEN:
            if (isTimestamp) {
                return (
                    <MultipleInputsWrapper>
                        <StyledDateRangeInput
                            allowSingleDayRange
                            className={disabled ? 'disabled-filter' : ''}
                            disabled={disabled}
                            formatDate={(value: Date) =>
                                moment(value)
                                    .format(`YYYY-MM-DD, HH:mm:ss:SSS`)
                                    .toString()
                            }
                            parseDate={(value) =>
                                moment(
                                    value,
                                    `YYYY-MM-DD, HH:mm:ss:SSS`,
                                ).toDate()
                            }
                            value={[
                                rule.values?.[0]
                                    ? new Date(rule.values?.[0])
                                    : null,
                                rule.values?.[1]
                                    ? new Date(rule.values?.[1])
                                    : null,
                            ]}
                            timePrecision="millisecond"
                            onChange={(
                                range: [Date | null, Date | null] | null,
                            ) => {
                                if (range && (range[0] || range[1])) {
                                    onChange({
                                        ...rule,
                                        values: [range[0], range[1]],
                                    });
                                }
                            }}
                            popoverProps={{
                                placement: 'bottom',
                                ...popoverProps,
                            }}
                            dayPickerProps={{
                                firstDayOfWeek: isWeekDay(startOfWeek)
                                    ? normalizeWeekDay(startOfWeek)
                                    : undefined,
                            }}
                            closeOnSelection={false}
                            shortcuts={false}
                            maxDate={moment(new Date())
                                .add(7, 'years')
                                .toDate()}
                        />
                    </MultipleInputsWrapper>
                );
            }

            return (
                <MultipleInputsWrapper>
                    <StyledDateRangeInput
                        className={disabled ? 'disabled-filter' : ''}
                        placeholder={placeholder}
                        disabled={disabled}
                        formatDate={(value: Date) =>
                            formatDate(value, undefined, false)
                        }
                        parseDate={parseDate}
                        value={[
                            rule.values?.[0]
                                ? parseDate(
                                      formatDate(
                                          rule.values?.[0],
                                          undefined,
                                          false,
                                      ),
                                      TimeFrames.DAY,
                                  )
                                : null,
                            rule.values?.[1]
                                ? parseDate(
                                      formatDate(
                                          rule.values?.[1],
                                          undefined,
                                          false,
                                      ),
                                      TimeFrames.DAY,
                                  )
                                : null,
                        ]}
                        onChange={(
                            range: [Date | null, Date | null] | null,
                        ) => {
                            if (range && (range[0] || range[1])) {
                                onChange({
                                    ...rule,
                                    values: [
                                        formatDate(
                                            range[0]
                                                ? range[0]
                                                : moment(range[1]).add(
                                                      -1,
                                                      'days',
                                                  ),
                                            undefined,
                                            false,
                                        ),
                                        formatDate(
                                            range[1]
                                                ? range[1]
                                                : moment(range[0]).add(
                                                      1,
                                                      'days',
                                                  ),
                                            undefined,
                                            false,
                                        ),
                                    ],
                                });
                            }
                        }}
                        popoverProps={{
                            placement: 'bottom',
                            ...popoverProps,
                        }}
                        dayPickerProps={{
                            firstDayOfWeek: isWeekDay(startOfWeek)
                                ? normalizeWeekDay(startOfWeek)
                                : undefined,
                        }}
                        closeOnSelection={true}
                        shortcuts={false}
                        maxDate={moment(new Date()).add(7, 'years').toDate()}
                    />
                </MultipleInputsWrapper>
            );
        default: {
            return <DefaultFilterInputs {...props} />;
        }
    }
};

export default DateFilterInputs;
